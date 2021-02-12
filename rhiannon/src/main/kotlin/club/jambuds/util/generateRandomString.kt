package club.jambuds.util

import java.security.SecureRandom

// via https://stackoverflow.com/a/157202
fun generateRandomString(len: Int): String {
    val ab = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    val rnd = SecureRandom()
    val sb = StringBuilder(len)
    for (i in 0 until len) {
        sb.append(ab[rnd.nextInt(ab.length)])
    }
    return sb.toString()
}

// via https://stackoverflow.com/a/157202
fun generateRandomNumberString(len: Int): String {
    val ab = "0123456789"
    val rnd = SecureRandom()
    val sb = StringBuilder(len)
    for (i in 0 until len) {
        sb.append(ab[rnd.nextInt(ab.length)])
    }
    return sb.toString()
}
