const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "f94da287-545f-4dfd-8ee0-91eb7095cef4",
    "Content-Type": "application/json",
  },
};

async function request(path, method = "GET", data) {
  const response = await fetch(config.baseUrl + path, {
    method,
    headers: config.headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Сервер вернул ошибку ${response.status}`);
  }
  return response.json();
}

export const getProfile = () => request("/users/me");
export const getCards = () => request("/cards");
export const updateProfile = (name, about) => request("/users/me", "PATCH", { name, about });
export const updateAvatar = (avatar) => request("/users/me/avatar", "PATCH", { avatar });
export const addCard = (name, link) => request("/cards", "POST", { name, link });
export const deleteCard = (id) => request(`/cards/${id}`, "DELETE");
export const setLike = (id, liked) => request(`/cards/likes/${id}`, liked ? "PUT" : "DELETE");
