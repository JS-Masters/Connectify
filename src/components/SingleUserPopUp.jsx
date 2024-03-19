import { useState } from "react";

const CustomModal = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <span style={{ float: "right" }}>
      <button
        onClick={openModal}
        style={{ margin: "4px", backgroundColor: "green", width: "25px" }}
      >
        +
      </button>
      {modalOpen && (
        <dialog open>
          <button className="close-button" onClick={closeModal}>
            X
          </button>
          <p>Modal content goes here.</p>
        </dialog>
      )}
    </span>
  );
};

export default CustomModal;
