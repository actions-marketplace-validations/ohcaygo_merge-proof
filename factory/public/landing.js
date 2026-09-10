"use strict";
if (location.hash.startsWith("#access=") || location.hash === "#paid")
  location.replace("/legacy" + location.hash);
