import * as api from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const infoPopup = document.querySelector(".popup_type_info");
const infoDetails = infoPopup.querySelector(".popup__info");
const infoUsers = infoPopup.querySelector(".popup__list");
const detailTemplate = document.querySelector("#popup-info-definition-template").content;
const userTemplate = document.querySelector("#popup-info-user-preview-template").content;
const sessionForm = document.querySelector(".session-form");
const status = document.querySelector(".request-status");
const profileControls = [profileAvatar, openProfileFormButton, openCardFormButton];
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric", month: "long", year: "numeric",
});
let currentUserId;
let infoRequest = 0;

function showError(error) {
  status.textContent = `${error.message}. Проверьте подключение и попробуйте снова.`;
  status.hidden = false;
}

function openPopup(popup) {
  infoRequest++;
  status.hidden = true;
  openModalWindow(popup);
}

function renderProfile(user) {
  profileTitle.textContent = user.name;
  profileDescription.textContent = user.about;
  profileAvatar.style.backgroundImage = `url("${CSS.escape(user.avatar)}")`;
}

function preview(card) {
  imageElement.src = card.link;
  imageElement.alt = card.name;
  imageCaption.textContent = card.name;
  openPopup(imageModalWindow);
}

function createDetail(label, value) {
  const item = detailTemplate.firstElementChild.cloneNode(true);
  item.querySelector("dt").textContent = label;
  item.querySelector("dd").textContent = value;
  return item;
}

async function showInfo(id) {
  const request = ++infoRequest;
  try {
    const cards = await api.getCards();
    if (request !== infoRequest) return;
    const card = cards.find((item) => item._id === id);
    if (!card) throw new Error("Карточка уже удалена");
    infoDetails.replaceChildren(
      createDetail("Описание", card.name),
      createDetail("Дата создания", dateFormatter.format(new Date(card.createdAt))),
      createDetail("Владелец", card.owner.name),
      createDetail("Количество лайков", card.likes.length)
    );
    const names = card.likes.length ? card.likes.map((user) => user.name) : ["Пока никто"];
    infoUsers.replaceChildren(...names.map((name) => {
      const item = userTemplate.firstElementChild.cloneNode(true);
      item.textContent = name;
      return item;
    }));
    openPopup(infoPopup);
  } catch (error) {
    if (request === infoRequest) showError(error);
  }
}

const cardActions = { preview, showInfo, setLike: api.setLike, deleteCard: api.deleteCard, showError };

function renderCard(card) {
  return createCardElement(card, currentUserId, cardActions);
}

function bindForm(form, popup, opener, prepare, save, pendingText) {
  const button = form.querySelector("[type=submit]");
  const fields = form.querySelectorAll("input");
  const label = button.textContent.trim();
  opener.addEventListener("click", () => {
    prepare();
    clearValidation(form, validationSettings);
    openPopup(popup);
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.disabled || !form.checkValidity()) return;
    button.disabled = true;
    opener.disabled = true;
    fields.forEach((field) => { field.readOnly = true; });
    button.textContent = pendingText;
    status.hidden = true;
    try {
      await save();
      form.reset();
      if (popup.classList.contains("popup_is-opened")) closeModalWindow(popup);
    } catch (error) {
      showError(error);
    } finally {
      fields.forEach((field) => { field.readOnly = false; });
      button.textContent = label;
      button.disabled = !form.checkValidity();
      button.classList.toggle(validationSettings.inactiveButtonClass, button.disabled);
      opener.disabled = false;
    }
  });
}

enableValidation(validationSettings);
document.querySelectorAll(".popup").forEach(setCloseModalWindowEventListeners);

bindForm(profileForm, profileFormModalWindow, openProfileFormButton, () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
}, async () => {
  renderProfile(await api.updateProfile(profileTitleInput.value, profileDescriptionInput.value));
}, "Сохранение…");

bindForm(avatarForm, avatarFormModalWindow, profileAvatar, () => avatarForm.reset(), async () => {
  const user = await api.updateAvatar(avatarInput.value);
  profileAvatar.style.backgroundImage = `url("${CSS.escape(user.avatar)}")`;
}, "Сохранение…");

bindForm(cardForm, cardFormModalWindow, openCardFormButton, () => cardForm.reset(), async () => {
  const card = await api.addCard(cardNameInput.value, cardLinkInput.value);
  placesWrap.prepend(renderCard(card));
}, "Создание…");

async function loadPage(token, remember = false) {
  const connectButton = sessionForm.querySelector("button");
  connectButton.disabled = true;
  status.hidden = true;
  api.setToken(token);
  try {
    const [user, cards] = await Promise.all([api.getProfile(), api.getCards()]);
    currentUserId = user._id;
    renderProfile(user);
    placesWrap.replaceChildren(...cards.map(renderCard));
    profileControls.forEach((control) => { control.disabled = false; });
    if (remember) sessionStorage.setItem("mesto-token", token);
    sessionForm.reset();
    sessionForm.hidden = true;
  } catch (error) {
    sessionForm.hidden = false;
    showError(error);
  } finally {
    connectButton.disabled = false;
  }
}

sessionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadPage(sessionForm.elements.token.value.trim(), true);
});

const token = sessionStorage.getItem("mesto-token") || (import.meta.env.DEV
  ? import.meta.env.VITE_MESTO_TOKEN
  : import.meta.env.VITE_PUBLIC_MESTO_TOKEN);
if (token) {
  loadPage(token);
} else {
  sessionForm.hidden = false;
}
