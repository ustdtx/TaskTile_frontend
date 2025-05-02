import styled from "styled-components";

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
  z-index: 1001;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

interface ProfileModalProps {
  user: { username: string; email: string };
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  return (
    <>
      <Overlay onClick={onClose} />
      <Modal>
        <h2>Profile</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: "10px",
            background: "#0070f3",
            color: "white",
            padding: "8px 12px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </Modal>
    </>
  );
};

export default ProfileModal;
