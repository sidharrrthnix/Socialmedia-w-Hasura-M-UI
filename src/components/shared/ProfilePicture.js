import React, { useContext, useRef, useState } from "react";
import { useProfilePictureStyles } from "../../styles";
import { Person } from "@material-ui/icons";
import handleImageUpload from "../../utils/handleImageUpload";
import { useMutation } from "@apollo/client";
import { EDIT_USER_AVATAR } from "../../graphql/mutations";
import { UserContext } from "../../App";
function ProfilePicture({ size, image, isOwner }) {
  const classes = useProfilePictureStyles({ size, isOwner });
  const inputRef = useRef();
  function openFileInput() {
    inputRef.current.click();
  }
  const { currentUserId } = useContext(UserContext);
  const [img, setImg] = useState(image);
  const [editUserAvatar] = useMutation(EDIT_USER_AVATAR);
  async function handleUpdateProfilePic(event) {
    const url = await handleImageUpload(event.target.files[0], "avatar");
    const variables = { id: currentUserId, profileImage: url };
    await editUserAvatar({ variables });
    setImg(url);
  }
  return (
    <section className={classes.section}>
      <input
        ref={inputRef}
        style={{ display: "none" }}
        type="file"
        onChange={handleUpdateProfilePic}
      />
      {image ? (
        <div
          className={classes.wrapper}
          onClick={isOwner ? openFileInput : () => null}
        >
          <img src={img} alt="user profile" className={classes.image} />
        </div>
      ) : (
        <div className={classes.wrapper}>
          <Person className={classes.person} />
        </div>
      )}
    </section>
  );
}

export default ProfilePicture;
