import React, { useState, useEffect } from "react";
import StarRatings from 'react-star-ratings';
import { Link } from "gatsby"
import {getProductURL} from './../utils/url';
import Layout from "../components/layout";
import { FaRegHeart } from 'react-icons/fa';
import { BiShoppingBag } from "react-icons/bi";
import { IoIosGitCompare } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import {getWLCount, wishListCount,viewCartItems,getCartCount } from '../utils/apiServices'
import { navigate } from "gatsby";


const Featuredproducts = () => {
    const [featureProducts, setFeatureProducts] = useState(null);
    const [customerId, setCustomerId] = useState("");
    const [jwt, setJwt] = useState("");
    const [p,per] = useState(false);
    const [outp,outper] = useState(false);
    const [pcar,percart] = useState(false);
    const [permits,setPermit] = useState([]);
    const [outpcar,outpercart] = useState(false);
    const [qty, setQty] = useState(1);
    const [quote_id, setQuoteId] = useState("");
    const [cartCnt, setCartCnt] = useState(getCartCount())
    const [isButton, setButton] = useState(false);


    useEffect(() => {
      setPermit(localStorage.permissions)
        setCustomerId(localStorage.customer_id)
        setJwt(localStorage.userToken)
        if(permits.length!=0){
          let addwis=permits.includes("Can Add To Wishlist")
          let addcar=permits.includes("Can Add To Cart")
          per(addwis)
          percart(addcar)
        }else if(!localStorage.permissions){
          outper(true)
          outpercart(true)
        }
        const jwt = localStorage.getItem('userToken')
        if(jwt){
          try
          {    
            axios({
              method : 'post',
              url: `${process.env.GATSBY_CART_URL_STARCARE}carts/mine`,
              headers : {
                  'Authorization' : `Bearer ${jwt}`
              }
            })
            .then((response) => {
              if(response.statusText === "OK" && response.status == 200)
              {
                console.log(response.data)
                  localStorage.setItem('cartId',response.data);
                  setQuoteId(localStorage.cartId)
              }
            }) 
            .catch((error) => {
              console.error(error,'error')
            })
          }catch(err){
            console.error(err);
            toast.error('something went wrong')
          }
        }else{
            
        }
        const fetchFeature = async () => {
            const res = await fetch(
                `${process.env.GATSBY_CART_URL_STARCARE}featureproducts/${localStorage.customer_id}`
            );
            const json = await res.json();
            await setFeatureProducts(json);
             
        };
        fetchFeature();
    }, []);
    const addtoCartItems = (sku, id) => {
      if (localStorage.userToken) {
          const cartItem = {
              "cartItem": {
                  "sku": sku,
                  "qty": qty,
                  "quote_id": quote_id
              }
          }
          setButton(true);
          const jwt = localStorage.userToken
          if (cartItem) {
              try {
                  axios({
                      method: 'post',
                      url: `${process.env.GATSBY_API_BASE_URL_STARCARE}carts/mine/items`,
                      data: cartItem,
                      headers: {
                          'Authorization': `Bearer ${jwt}`
                      }
                  }).then((res) => {
                      if (res.statusText === "OK" && res.status == 200) {
                          viewCartItems();
                          // removeProduct(id, 'cart')
                          toast.success('Succesfully added to cart');
                          setTimeout(() => {
                              setCartCnt(getCartCount())
                          }, 3000);
                          setButton(false);
                      }
                  }).catch((err) => {
                      console.error(err);
                      toast.error('Failed to add cart')
                  })
              } catch (err) {
                  console.error(err)
              }
          }
      }
      else {
          localStorage.clear()
          navigate("/signin")
      }
  }
    const addToList = (type,id) => {
        // type 1 = wishlist
        // type 2 = comparelist
        let url = (type == 1 ? `${process.env.GATSBY_CART_URL_STARCARE}admin/addtocompare/2` : `${process.env.GATSBY_CART_URL_STARCARE}wishlist/addwishlist_product/`)
        let message = (type == 1 ? 'Sucessfully added to  compare list' : 'Sucessfully added to wish list')
        let productData = {
          "data": {
            "customer_id": customerId,
            "product_id": id
          }
        }
    
        try {
          axios({
            method: 'post',
            url: url,
            data: productData,
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          }).then((res) => {
            if (res.statusText === "OK" && res.status == 200) {
              toast.success(message)
              wishListCount()
              setTimeout(()=>{
                getWLCount()
              },2000)
            }
          }).catch((err) => {
            toast.error(err)
          })
        } catch (err) {
          toast.error(err)
        }
    
      }

    const renderProducts = () => {    
        if (featureProducts) { 
            return <div className="row products_fp">   
                {       
                    featureProducts.map((data,index) => (
                        <div className="item product_item sample" key={`${data.name}_${index}`}>
                            <div className="card">    
                            {p && <div className="wishComp">
                                    <ul>
                                      <li><a onClick={() => addToList(2,data.id)}><FaRegHeart /></a></li>
                                    </ul>
                                </div>}
                                {outp && <div className="wishComp">
                                    <ul>
                                      <li><a onClick={() => addToList(2,data.id)}><FaRegHeart /></a></li>
                                    </ul>
                                </div>}
                              
                                <div className="image_wrapper">
                                {/* <div className="actn_btn_holder">                                  
                                    <ul>
                                      <li className="icn"><BiShoppingBag/></li>
                                      <li>{ <Link className="btn" to={getProductURL(data)}
                                    state={data}>View Detail</Link> }</li>
                                      <li className="icn"><a onClick={() => addToList(1,data.id)}><IoIosGitCompare/></a></li>
                                    </ul>                                
                                </div> */}
                                 <Link to={getProductURL(data)}>
                                 <img src={data.image} />
                                 </Link>
                                    

                                </div>                                
                                <p className="product_title">{data.name}</p>
                                <div className="price_holder">
                                <div className="price_left">                                  
                                    <div className="product_amt">
                                    {data.strike_price != null  && <span className="new_price">${Math.round(data.strike_price)}</span>}
                                        <span className="price">${Math.round(data.original_price)}</span>
                                        
                                    </div>
                                    <div className="rating_front">
                                    <StarRatings
                                        rating={Math.round(data.ratings_summary)}
                                        numberOfStars={5}
                                        name='rating'
                                        starDimension="20px"
                                        starSpacing="0px"
                                        starRatedColor="rgb(242 187 22)"
                                        svgIconViewBox="0 0 32 32"
                                        svgIconPath="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798zM16 23.547l-6.983 3.671 1.334-7.776-5.65-5.507 7.808-1.134 3.492-7.075 3.492 7.075 7.807 1.134-5.65 5.507 1.334 7.776-6.983-3.671z"
                                    />
                                    
                                    </div>
                                </div>
                                   {pcar && <div className="price_right">                                   
                                  <button className="addtocart" onClick={() => addtoCartItems(data.sku, data.id)}><span class="cart_svg"></span></button>
                                  </div>}
                                  {outpcar && <div className="price_right">                                   
                                  <button className="addtocart" onClick={() => addtoCartItems(data.sku, data.id)}><span class="cart_svg"></span></button>
                                  </div>}
                                </div>
                            </div>

                        </div>
                    ))
                }
            </div>
        }
    }
    
    return (
        <Layout>
          <div className="content_wrapper">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                <div className="main_title left">
                    <h1>
                      Our Featured Products
                   
                  {/* <span></span> <div className="breadcrumbs_sec" >
                    adasd
                  </div> */}
                  </h1>
                  </div>
                  <div className="category_container">
                    
                      <div className="cat_scroll">
                        <div className="container">
                          
                  {renderProducts()}
                  
                  </div>
                  </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Layout>
    )
}  

export default Featuredproducts;