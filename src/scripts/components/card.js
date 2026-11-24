const cardTemplate = document.querySelector("#card-template").content;

export function createCardElement(card, userId, actions) {
  const element = cardTemplate.querySelector(".card").cloneNode(true);
  const image = element.querySelector(".card__image");
  const like = element.querySelector(".card__like-button");
  const count = element.querySelector(".card__like-count");
  const remove = element.querySelector(".card__control-button_type_delete");
  const info = element.querySelector(".card__control-button_type_info");

  function renderLikes(likes) {
    const liked = likes.some((user) => user._id === userId);
    like.classList.toggle("card__like-button_is-active", liked);
    like.setAttribute("aria-pressed", String(liked));
    count.textContent = likes.length;
  }

  image.src = card.link;
  image.alt = card.name;
  element.querySelector(".card__title").textContent = card.name;
  renderLikes(card.likes);
  image.addEventListener("click", () => actions.preview(card));
  info.addEventListener("click", () => actions.showInfo(card._id));
  like.addEventListener("click", async () => {
    like.disabled = true;
    try {
      const updated = await actions.setLike(card._id, like.getAttribute("aria-pressed") !== "true");
      renderLikes(updated.likes);
    } catch (error) {
      actions.showError(error);
    } finally {
      like.disabled = false;
    }
  });

  if (card.owner._id === userId) {
    remove.addEventListener("click", async () => {
      remove.disabled = true;
      try {
        await actions.deleteCard(card._id);
        element.remove();
      } catch (error) {
        actions.showError(error);
        remove.disabled = false;
      }
    });
  } else {
    remove.remove();
  }
  return element;
}
