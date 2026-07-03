interface AvatarProps {
  firstName: string | null;
  lastName: string | null;
  onClick: () => void;
}

const Avatar = ({ firstName, lastName, onClick }: AvatarProps) => {
  const initials =
    firstName || lastName
      ? `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
      : null;

  return (
    <button className="avatar-btn" onClick={onClick} title="Profile">
      {initials ? (
        <span className="avatar-initials">{initials}</span>
      ) : (
        <svg
            className="avatar-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <circle cx="12" cy="8" r="4" fill="#1e90ff" />
            <path
                d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                stroke="#1e90ff"
                strokeWidth="2"
                strokeLinecap="butt"
                fill="#1e90ff"
            />
        </svg>
      )}
    </button>
  );
};

export default Avatar;