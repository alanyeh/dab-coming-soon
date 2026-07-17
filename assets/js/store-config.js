window.DAB_STORE = Object.freeze({
  enabled: true,
  product: Object.freeze({
    name: "Dab Block",
    eyebrow: "Limited first run",
    price: "",
    shipping: "Shipping details announced at launch.",
    returns: "Returns policy announced at launch.",
    variants: Object.freeze([
      Object.freeze({
        id: "hold-type-01",
        name: "DAB BLOCK 02",
        description: "20 mm and 25 mm edges",
        price: "$40.00",
        modelUrl: "/assets/models/DAB-BLOCK-LARGE.3mf?v=20260717-3",
        checkoutUrl: "https://checkout.dabclimbing.com/b/cNi00l9lb1C9fbkd334wM00"
      }),
      Object.freeze({
        id: "hold-type-02",
        name: "DAB BLOCK 01",
        description: "20 mm edge",
        price: "$30.00",
        modelUrl: "/assets/models/DAB-BLOCK-01.3mf",
        checkoutUrl: "https://checkout.dabclimbing.com/b/dRm4gB2WNdkR0gqaUV4wM01"
      }),
      Object.freeze({
        id: "hold-type-custom",
        name: "Dab Block Custom",
        description: "Made to your approved specifications",
        price: "Set after approval",
        modelUrl: "/assets/models/DAB-BLOCK-LARGE.3mf?v=20260717-3",
        checkoutUrl: "",
        requiresApproval: true
      })
    ])
  })
});
