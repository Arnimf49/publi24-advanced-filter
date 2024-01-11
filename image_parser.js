if (typeof browser === "undefined") {
  var browser = chrome;
}

function parseResults() {
  const wwid = new URLSearchParams(window.location.search).get('wwiid');
  const imgUrl = new URLSearchParams(window.location.search).get('wwimg');
  const index = new URLSearchParams(window.location.search).get('wwindex');

  if (!wwid || !imgUrl) {
    // If these plugin specific query params are not available then abort.
    return;
  }

  const searchByImageBtn = document.body.querySelector('[data-is-images-mode]');
  searchByImageBtn.click();

  setTimeout(() => {
      setTimeout(() => {
      const imageField = document.body.querySelector('[autocomplete="false"]');
      imageField.value = imgUrl;

      const submitBtn = document.body.querySelector('[autocomplete="false"] + div');
      submitBtn.click();
    })
    // Delay for semi iterative multi image search. Avoids storage access conflicts.
  }, 300 + (index * 600));
}

setInterval(parseResults, 500);
