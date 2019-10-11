## `select *`

### The Problem

The use of `select * from table` isn't exactly an antipattern in itself, but it gets nasty when you need to join tables together with overlapping column names. Imagine the following schema:

* books
  * id: int
  * title: string
  * author_id: int
* authors
  * id: int
  * name: string

If you were to run the following to get the books and their authors together:

```sql
select * from books join authors where books.author_id = authors.id;
```

You'd get back a table something like:

```
id | title             | author_id | id | name
---+-------------------+-----------+----+------------------
1  | A Christmas Carol | 5         | 5  | Charles Dickens
```

Unfortunately, most naive query-builders and DB access libraries for JS return rows as simple column name-value pairs, which in this case would have a collision on `id`, between the book ID and the author ID. This could lead to subtle (or not-so-subtle) bugs due to the ID being either the book ID or author ID, depending on the implementation of the query library.

There's no good way to automagically namespace columns you get from `select *` in Postgres, as far as I can tell. I think some other DB engines might have solutions for this, but the hilarious answer I've heard for node-postgres is to use _`to_json`_, which is as ridiculous as it sounds:

```
select to_json(books.*) as book, to_json(authors.*) as author
  from books join authors on books.author_id=authors.id;

book                                               | author
---------------------------------------------------+-------------------------------------
{"title":"A Christmas Carol","id":1,"author_id":5} | {"name":"Charles Dickens","id":5}
```

In a world where databases were already stores of just JSON data types, this could almost make sense, but in a world where this conversion will _cast SQL timestamps to JSON strings_, this is truly impractical.

### Potential Solution

So, first off, the only solutions to this problem that would let you entirely avoid defining which columns you're selecting in code would basically require DB schema introspection. This is, like, [jOOQ](https://www.jooq.org/) territory; there is no world in which I write this code generation.

So, given that I'm okay writing out every column I'm getting in the `SELECT()` statements, I could create some kind of namespacing utility, that turns:

```js
prefixedSelect(
  // [table name, result name, fields]
  ['books', 'book', ['title', 'id'],
  ['authors', 'author', ['id', 'name']]
);
```

into:

```sql
SELECT (
  books.title AS book.title,
  books.id AS book.id,
  authors.id AS author.id,
  authors.name AS author.name
) FROM books JOIN authors ON books.author_id=authors.id;
```

Then I could presumedly create something to turn dot-separated objects in the result table into objects:

```js
const row = query(...);

const {book, author} = rowToObjects(row);
```

I'm not sure what problems would come up with this. One nice thing about this is that it's relatively portable - I could do this with Knex as easily as I could with [Slonik](https://github.com/gajus/slonik), were I to want to make that switch. As long as I can generate pairs of (`qualified_field_name AS dot_separated_field_name`), and can transform `{book.name: 'Christmas Carol'}` to `{book: {name: 'Christmas Carol}}`, I think I'm golden.