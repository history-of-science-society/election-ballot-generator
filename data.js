const axios = require("axios").default;

axios
  .get("/user?ID=12345", {
    params: {
      data: true
    },
    auth: `Bearer ${process.env.FORMSTACK_API}`
  })
  .then(function(response) {
    // handle success
    console.log(response);
  })
  .catch(function(error) {
    // handle error
    console.log(error);
  })
  .then(function() {
    // always executed
  });
