import React, { useEffect} from "react";
import { makeStyles } from "@material-ui/core/styles";
import SadCart from "../images/SadCart.png";
import { useShoppingCart } from "use-shopping-cart";
import { formatPrice } from "./Products/ProductCard";
import SadCartShadow from "../images/SadCartShadow.png";
import HappyCart from "../images/HappyCart.png";
import { Link, useStaticQuery, graphql } from "gatsby";
import CartTable from "./CartTable";
import { useMediaQuery } from "@material-ui/core";

const useStyle = makeStyles({
  title: {
    color: "#F88A17",
  },
  shoppingButton: {
    padding: "1rem",
    background: "#FFCDB7",
    border: "2px solid #FFE1D4",
    color: "#EF7E65",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "15rem",
    flexDirection: "row",
    "&:hover": {
      filter: "brightness(104%)",
    },
  },
  "@keyframes floatAnimation": {
    from: { transform: "translate(0%,2%)" },
    to: { transform: "translate(0%,-2%)" },
  },
  // }),
  subtotal: {
    display: "flex",
    justifyContent: "flex-end",
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  cartContainer: {
    // maxWidth: '70%',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  checkoutButton: (props) => ({
    marginTop: props.marginTop,
    padding: "1rem",
    background: "#FFDAAC",
    border: "2px solid #FCE5C6",
    color: "#F88A17",
    borderRadius: "0.5rem",
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      filter: "brightness(104%)",
    },
  }),
  checkoutContainer: (props) => ({
    width: "100%",
    display: "flex",
    flexDirection: props.flexDirection,
    justifyContent: "space-between",
    alignItems: props.alignItems,
  }),
  cartAndShadow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "1rem",
  },
  checkoutAndCartImage: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  happyCart: {
    animation: "1s $floatAnimation infinite  cubic-bezier(0.37, 0, 0.63, 1)",
    animationDirection: "alternate",
    transform: "translate(90%)",
    marginTop: "1rem",
  },
});

export const shippingQuery = graphql`
  query ShippingQuery {
    stripePrice(product :{name : {eq :"Shipping"}}) {
      id
      unit_amount
      currency
      product {
	id
	name
      }
    }
  }
`;
const phoneProps = {
  alignItems: "center",
  flexDirection: "column",
  height: "1.75rem",
  width: " 1.75rem",
  fontSize: "0.85rem",
  marginTop: "1rem",
  marginBottom: ".75rem",
};

const normalProps = {
  width: "3rem",
  height: "3rem",
  alignItems: "flex-end",
  flexDirection: "row",
  fontSize: "1rem",
  marginTop: "0rem",
  marginBottom: "0rem",
};

const EmptyCartView = ({ classes }) => {
  return (
    <div className={classes.cartContainer}>
      <div>
        <h1 className={classes.title}>YOUR CART</h1>
      </div>
      <div className={classes.emptyCartMsg}>
        Your cart is currently empty!
      </div>
      <div className={classes.cartAndShadow}>
        <div className={classes.happyCart}>
          <img src={SadCart} height="200" alt="sad cart" />
        </div>
        <img src={SadCartShadow} width="180" alt="sad cart shadow" />
      </div>
      <Link to="/" className={classes.shoppingButton}>
        <div>Continue Shopping</div>
      </Link>
    </div>
  );
};

const Subtotal = ({ classes, value }) => {
  return (
    <p className={classes.subtotal}>
      Subtotal:{" "}
      {value}
    </p>
  );
};

const CheckoutButton = ({ handleCheckout, classes }) => {
  return (
    <div className={classes.checkoutContainer}>
      <Link to="/" className={classes.shoppingButton}>
        <div>Continue Shopping</div>
      </Link>
      <button
        className={classes.checkoutButton}
        onClick={handleCheckout}
      >
        CHECKOUT
      </button>
    </div>
  );
};

export const FloatingCartIcon = ({ phoneMatches, classes }) => {
  return (
    <div className={classes.cartAndShadow}>
      <div className={classes.happyCart}>
        <img src={HappyCart} alt="happy cart" height={phoneMatches ? "170" : "200"} />
      </div>
      <img src={SadCartShadow} width={phoneMatches ? "153" : "180"} alt="happy cart shadow" />
    </div>
  );
};
const CartView = ({ classes, phoneMatches }) => {
  const {
    cartDetails,
    totalPrice,
    setItemQuantity,
    addItem,
    removeItem,
    redirectToCheckout,
  } = useShoppingCart();
  const shippingData = useStaticQuery(shippingQuery);
  //alert(JSON.stringify(shippingData))
  const shippingPrice = shippingData.stripePrice;
  const shippingProduct = {
    sku: shippingPrice.id,
    name : shippingPrice.product.name,
    price : shippingPrice.unit_amount,
    currency: shippingPrice.currency,
  };
  useEffect(()=>{
    addItem(shippingProduct)
    setItemQuantity(shippingProduct.sku,1);
  },[addItem,shippingProduct,setItemQuantity])
  const subTotalValue = formatPrice(
    totalPrice,
    Object.values(cartDetails)[0].currency,
  );
  //addItem(shippingSku)

  const handleCheckout = () => {
    removeItem(shippingProduct.sku)
    addItem(shippingProduct)
    setItemQuantity(shippingProduct.sku,1);
    redirectToCheckout()
  };

  const products = Object.values(cartDetails).filter(product => product.name !== "Shipping")

  return (
    <div className={classes.cartContainer}>
      <h1 className={classes.title}>YOUR CART</h1>
      <div className={classes.cartContainer}>
        <div className={classes.checkoutAndCartImage}>
          <CartTable products={products}/>
        </div>
        <Subtotal classes={classes} value={subTotalValue} />
        <CheckoutButton handleCheckout={handleCheckout} classes={classes} />
        <FloatingCartIcon classes={classes} phoneMatches={phoneMatches} />
      </div>
    </div>
  );
};

export const CartPage = () => {
  let props;
  const phoneMatches = useMediaQuery("(max-width: 580px)");
  if (phoneMatches) {
    props = phoneProps;
  } else {
    props = normalProps;
  }
  const classes = useStyle(props);
  const { cartDetails } = useShoppingCart({});
  const realCartCount = Object.values(cartDetails).filter(product => product.name !== "Shipping").length
  if (realCartCount === 0) {
    return <EmptyCartView classes={classes} />;
  } else {
    return <CartView classes={classes} phoneMatches={phoneMatches} />;
  }
};

export default CartPage;
