import React, { useRef, useEffect, useState } from "react"
import { useForm } from "react-hook-form";
import axios from "axios";
import { navigate, Link } from "gatsby";
import logo from './../assets/logo.png';
import { viewCartItems, wishListCount, getWLCount} from "./../utils/apiServices";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import sign_bg from './../assets/bg.jpg';
import PageLoader from "../components/loaders/pageLoader";
import { checkUser } from "./../services/headerServices";

const SignIn = (props) => {

  const { register, handleSubmit, errors } = useForm();
  const _isMounted = useRef(false);
  const [isButton, setButton] = useState(false);
  const [loader, setLoader] = useState(false);
  const [wishListCnt, setWishListCnt] = useState(getWLCount());

 

  useEffect(() => {
    return () => { _isMounted.current = true }
  }, []);

  const onSubmit = userCredential => {
    setLoader(true);
    let userLoginData = {
      "data":
      {
        "username": userCredential.username.trim(),
        "password": userCredential.password.trim(),
      }
    }

    try {
      axios({
        method: 'post',
        url: `${process.env.GATSBY_CART_URL_STARCARE}customerlogin/id`,
        data: userLoginData,
       
      })
      
        .then(function (response) {
          if (response.statusText === "OK" && response.status == 200 ) {
            
            let categoryJson = [];
            if(response.data[0]['approve_account'] === "approved"){
            if (typeof (response.data[0]['token']) === 'string') {
              if(response.data[0]['category_permissions']){
                for (let key in response.data[0]['category_permissions']) {
                  categoryJson.push(response.data[0]['category_permissions'][key].id);
                }
                localStorage.setItem('category_permissions', categoryJson.toString());
              }
              if(response.data[0]['allowed_permissions']){
                localStorage.setItem('permissions', response.data[0]['allowed_permissions']);
              }
              localStorage.setItem('userToken', response.data[0]['token']);
              localStorage.setItem('email', response.data[0]['email']);
              localStorage.setItem('customer_id', response.data[0]['customer_id']);
              localStorage.setItem('user_name', response.data[0]['name'])
              createCart(response.data[0]['token']);
              getWishList();
              fetchRegion();
              checkUser();
            } else {
              setLoader(false);
              toast.error(response.data[0]['token']['message']);
            }
          }else{
            setLoader(false);
             toast.error('Admin need to approve you')
          }
          }
        })
        .catch(function (response) {
          setLoader(false);
          toast.error('An error occured please contact admin')
        });

    } catch (err) {
      setLoader(false);
      console.error(`An error occured ${err}`)
    }

  };

  const createCart = (token) => {
    if (token) {
      try {
        axios({
          method: 'post',
          url: `${process.env.GATSBY_CART_URL_STARCARE}carts/mine`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then((response) => {
            if (response.statusText === "OK" && response.status == 200) {
              localStorage.setItem('cartId', response.data);
              setButton(true)
              viewCartItems();
              setTimeout(() => {
                navigate('/');
                setLoader(false);
              }, 7000);
            }
          })
          .catch((error) => {
            setLoader(false);
            console.error(error, 'error')
          })
      } catch (err) {
        console.error(err);
        setLoader(false);
        toast.error('something went wrong')
      }
    }
  }

  const getWishList = () => {
    try {
        axios({
            method: "get",
            url: `${process.env.GATSBY_CART_URL_STARCARE}admin/getwishlist/${localStorage.customer_id}`,
            headers: {
                'Authorization': `Bearer ${localStorage.userToken}`
            },
        }).then((res) => {
            if (res.statusText === "OK" && res.status == 200) {
                // setWishList(res.data)
                wishListCount();
                wistlistsValue();
            }

        }).catch((err) => {
            console.error(err)
        })
    } catch (err) {
        console.error(err)
    }
}
const fetchRegion = async () => {
  const res = await fetch(
      `${process.env.GATSBY_CART_URL_STARCARE}regions`
  );

  const json = await res.json();
  localStorage.setItem("Regions",JSON.stringify(json));
};

const wistlistsValue = () => {
  setTimeout(() => {
    setWishListCnt(getWLCount());
  }, 3000);
}

  return (
     <>

    {loader ?
      (<div className="mx-auto">
          <PageLoader />
      </div>) :
      (<div className="login_page">
        <div className="wrapper">
          <div className="login_box">
            <div className="col-lg-6 col-md-6 col-xs-12 left_side">
              <img src={sign_bg} alt={"Laptop"} />
            </div>

            <div className="col-lg-6 col-md-6 col-xs-12 right_side">
              <div className="box_content">
                <div className="logo mb-3">
                  <Link to="/">
                    <img src={logo} />
                  </Link>
                </div>

                <h1>Sign-In</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="login_form">

                  <input className="form-control" name="username" placeholder="Email *" type="text" ref={register({
                    required: true,
                    pattern: /\S+@\S+\.\S+/
                  })} />
                  {errors.username && errors.username.type === 'required' && <span>Email field is required</span>}
                  {errors.username && errors.username.type === 'pattern' && <span>Valid email required</span>}
                  <input className="form-control" name="password" placeholder="Password *" type="password" ref={register({
                    required: true,
      
                  })} />
                  {errors.password && errors.password.type === 'required' && <span>Password field is required</span>}

                  <div className="my-3">
                    <input className="btn btn_gray submit_btn" type="submit" value="Sign-In" disabled={isButton} />
                  </div>

                </form>

                {/* <p className="user_link my-4">
                  <Link to="/changePassword">Forgot Password?</Link>
                </p> */}

                <p className="user_link">New to ProQmed? 
              <Link to="/signup" className="ml-2">Start here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>)
}

      {/* {tostrShow && <Toastr message={message}/>} */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
                
    </>
                
  )
}

export default SignIn
