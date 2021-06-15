import React from "react";
import Helmet from "react-helmet";
function SEO({ title }) {
  const titleText = title ? `${title} • Instagram` : "Instagram";
  return (
    <div>
      <Helmet>
        <title>{titleText}</title>
      </Helmet>
    </div>
  );
}

export default SEO;
