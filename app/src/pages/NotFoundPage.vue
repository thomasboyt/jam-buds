<template>
  <div class="error-page">
    <a class="error-image error-404" href="/">
      <span class="error-label">
        error: 404 page not found. click here to return home!
      </span>
    </a>
  </div>
</template>

<style scoped lang="scss">
.error-image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
}

.error-404 {
  background-image: url('../../static/404_dog.jpg');
}

.error-label {
  /* THIS IS ACTUALLY WHAT THE W3C RECOMMENDS FOR SCREEN READERS
     WHAT https://www.w3.org/TR/2012/NOTE-WCAG20-TECHS-20120103/C7 */
  height: 1px;
  width: 1px;
  position:
  absolute;
  overflow: hidden;
  top: -10px;
}
</style>