import React from "react";

function PopupWithForm({
  name,
  title,
  isOpen,
  onClose,
  children,
  buttonText,
  onSubmit,
  //onCloseOverlay,
}) {
  function handleOverlay(evt) {
    if (evt.target === evt.currentTarget) {
      console.log('1567')
      onClose(evt)
    }
  }
  return (
    <div className={`popup popup_type_${name} ${isOpen ? "popup_opened" : ""}`}>
      <div className="popup__overlay" onClick={handleOverlay}>
      <div className="popup__container">
          <button
            className={`popup__close popup__close_type_${name}`}
            type="button"
            onClick={onClose}
            aria-label="Закрыть форму"
          ></button>
          <h2 className="popup__title">{title}</h2>
          <form
            className="popup__form"
            name={`form-${name}`}
            onSubmit={onSubmit}
          >
            {children}
            <button
              className={`popup__save popup__save_type_${name}`}
              type="submit"
              aria-label="Сохранить"
              // onClick={onClose}
            >
              {buttonText}
            </button>
          </form>
      </div>
      </div>
    </div>
  );
}
export default PopupWithForm;