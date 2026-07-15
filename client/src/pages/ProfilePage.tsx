import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { fetchProfile, updateProfile, type Profile } from "../api/profile";
import { formatDisplayDate } from "../utils/progress";

interface ProfilePageProps {
  onSignOut: () => void;
  onProfileUpdate: (firstName: string | null, lastName: string | null) => void;
}

const computeAge = (birthDate: string): number => {
  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }
  return age;
};

const ProfilePage = ({ onSignOut, onProfileUpdate }: ProfilePageProps) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [heightUnit, setHeightUnit] = useState<"ft" | "cm">("ft");
  const [displayUnit, setDisplayUnit] = useState<"kg" | "lbs">("lbs");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        if (data.latestWeight) {
          setDisplayUnit(data.latestWeight.unit_entered);
        }
      })
      .catch(() => setErrorMsg("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const debouncedSave = useCallback(
        (updates: Partial<Omit<Profile, "latestWeight">>) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
            try {
                const updated = await updateProfile(updates);
                setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
                if ("first_name" in updates || "last_name" in updates) {
                onProfileUpdate(
                    updates.first_name !== undefined ? (updates.first_name ?? null) : profile?.first_name ?? null,
                    updates.last_name !== undefined ? (updates.last_name ?? null) : profile?.last_name ?? null
                );
                }
            } catch {
                setErrorMsg("Failed to save — changes may not have been saved");
            }
            }, 800);
        },
        [onProfileUpdate, profile?.first_name, profile?.last_name]
   );

  const handleField = (field: keyof Omit<Profile, "latestWeight">, value: string | number | null) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
    debouncedSave({ [field]: value });
  };

  const getDisplayWeight = () => {
    if (!profile?.latestWeight) return "No weight logged yet";
    const w = displayUnit === "kg"
      ? profile.latestWeight.weight_kg
      : profile.latestWeight.weight_lbs;
    return `${w} ${displayUnit}`;
  };

  const getCmHeight = () => {
  if (!profile) return "";
  if (profile.height_ft === null || profile.height_in === null) return "";
  const totalInches = (profile.height_ft ?? 0) * 12 + (profile.height_in ?? 0);
  return (totalInches * 2.54).toFixed(1);
};

  if (loading) return <div className="profile-page"><p>Loading...</p></div>;

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      {errorMsg && <p className="profile-error">{errorMsg}</p>}

      <div className="profile-form">

        {/* Name */}
        <div className="profile-field">
        <div className="name-inputs">
            <div className="name-input-group">
            <label>First Name:</label>
            <input
                type="text"
                value={profile?.first_name ?? ""}
                placeholder="First name"
                onChange={(e) => handleField("first_name", e.target.value || null)}
            />
            </div>
            <div className="name-input-group">
            <label>Last Name:</label>
            <input
                type="text"
                value={profile?.last_name ?? ""}
                placeholder="Last name"
                onChange={(e) => handleField("last_name", e.target.value || null)}
            />
            </div>
        </div>
        </div>

        {/* Age / Date of Birth */}
        <div className="profile-field">
          <label>
            Date of Birth:
            {profile?.birth_date && (
              <span className="profile-age">
                {" "}— Age {computeAge(profile.birth_date)}
              </span>
            )}
          </label>
          <input
            type="date"
            value={profile?.birth_date ?? ""}
            onChange={(e) => handleField("birth_date", e.target.value || null)}
          />
        </div>

        {/* Height */}
        <div className="profile-field">
        <label>Height:</label>
        {heightUnit === "ft" ? (
            <div className="height-inputs">
            <input
                type="number"
                min={0}
                max={9}
                value={profile?.height_ft ?? ""}
                placeholder="ft"
                onChange={(e) =>
                handleField("height_ft", e.target.value ? parseInt(e.target.value) : null)
                }
            />
            <span className="height-sep">ft</span>
            <input
                type="number"
                min={0}
                max={11}
                value={profile?.height_in ?? ""}
                placeholder="in"
                onChange={(e) =>
                handleField("height_in", e.target.value ? parseInt(e.target.value) : null)
                }
            />
            <span className="height-sep">in</span>
            </div>
        ) : (
            <div className="height-inputs">
            <input
                type="number"
                value={getCmHeight()}
                placeholder="cm"
                readOnly
            />
            <span className="height-sep">cm</span>
            </div>
        )}
        <div className="unit-toggle">
            <button
            className={heightUnit === "ft" ? "unit-btn active" : "unit-btn"}
            onClick={() => setHeightUnit("ft")}
            >
            ft
            </button>
            <button
            className={heightUnit === "cm" ? "unit-btn active" : "unit-btn"}
            onClick={() => setHeightUnit("cm")}
            >
            cm
            </button>
        </div>
        </div>

        {/* Sex */}
        {/* Sex */}
        <div className="profile-field">
            <label>Sex:</label>
            <div className="unit-toggle sex-toggle">
            <button
              className={profile?.sex === "male" ? "unit-btn active" : "unit-btn"}
              onClick={() => handleField("sex", profile?.sex === "male" ? null : "male")}
            >
              Male
            </button>
            <button
              className={profile?.sex === "female" ? "unit-btn active" : "unit-btn"}
              onClick={() => handleField("sex", profile?.sex === "female" ? null : "female")}
            >
              Female
            </button>
          </div>
        </div>

        {/* Weight (read-only) */}
        <div className="profile-field">
        <label>Current Weight:</label>
        <p className="profile-weight-display">{getDisplayWeight()}</p>
        <div className="unit-toggle">
            <button
            className={displayUnit === "lbs" ? "unit-btn active" : "unit-btn"}
            onClick={() => setDisplayUnit("lbs")}
            >
            lbs
            </button>
            <button
            className={displayUnit === "kg" ? "unit-btn active" : "unit-btn"}
            onClick={() => setDisplayUnit("kg")}
            >
            kg
            </button>
        </div>
        </div>

        {/* Sign Out */}
        <button
          className="sign-out-btn"
          onClick={() => {
            onSignOut();
            navigate("/");
          }}
        >
          Sign Out
        </button>

      </div>
    </div>
  );
};

export default ProfilePage;