import React from "react";
import { useProfilePictureStyles } from "../../styles";
import pp from "../../images/pp.jpeg";
import { Person } from "@material-ui/icons";
function ProfilePicture({ size, image = pp, isOwner }) {
  const classes = useProfilePictureStyles({ size, isOwner });

  return (
    <section className={classes.section}>
      {image ? (
        <div className={classes.wrapper}>
          <img src={image} alt="user profile" className={classes.image} />
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
