const store = window.DAB_STORE;
const comingSoonStatus = document.querySelector("#coming-soon-status");
const storeLink = document.querySelector("#store-link");

if (store?.enabled && storeLink) {
  storeLink.hidden = false;
  if (comingSoonStatus) comingSoonStatus.hidden = true;
}
