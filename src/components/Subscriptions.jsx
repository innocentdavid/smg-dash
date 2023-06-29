import Axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { TbRefresh } from "react-icons/tb";
import axios from 'axios'
// import CrispChat from "./CrispChat";
import { MdLogout } from "react-icons/md";
import { useClickOutside } from "react-click-outside-hook";
import { FaAngleLeft } from "react-icons/fa";
import AlertModal from './AlertModal'
import { useRef } from "react";
import { CardComponent, CardNumber, CardExpiry, CardCVV } from "@chargebee/chargebee-js-react-wrapper"
import { getRefCode, uploadImageFromURL } from "../helpers";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const urlEncode = function (data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && (!(data[p] === undefined || data[p] == null))) {
      str.push(encodeURIComponent(p) + "=" + (data[p] ? encodeURIComponent(data[p]) : ""));
    }
  }
  return str.join("&");
}

export default function Subscriptions() {
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [parentRef, isClickedOutside] = useClickOutside();
  const [errorMsg, setErrorMsg] = useState({ title: 'Alert', message: 'something went wrong' })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState({ id: 1, name: 'card' })
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    if (isClickedOutside) {
      setShowMenu(false)
    };
  }, [isClickedOutside]);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("users")
        .select()
        .eq("user_id", user.id);
      setUser(data?.[0]);
    };

    getData();
  }, []);

  var { username } = useParams();
  const [userResults, setUserResults] = useState(null);
  const navigate = useNavigate();

  // clearCookies
  useEffect(() => {
    var cookies = document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      while (d.length > 0) {
        var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
        var p = window.location.pathname.split('/');
        document.cookie = cookieBase + '/';
        while (p.length > 0) {
          document.cookie = cookieBase + p.join('/');
          p.pop();
        };
        d.shift();
        // console.log('done');
      }
    }
  }, [])

  const getData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) navigate('/');
    const options = {
      method: "GET",
      url: "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile",
      params: { ig: username, response_type: "short", corsEnabled: "true" },
      headers: {
        "X-RapidAPI-Key": "47e2a82623msh562f6553fe3aae6p10b5f4jsn431fcca8b82e",
        "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
      },
    };

    try {
      const response = await Axios.request(options);
      setUserResults(response?.data?.[0]);
    } catch (error) {
      console.log(error)
    }
  }, [navigate, username]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title={errorMsg?.title}
        message={errorMsg?.message}
      />
      <div id="affiliateScript"></div>
      {/* <CrispChat /> */}

      <script src="https://js.chargebee.com/v2/chargebee.js"></script>

      <div className="text-[#757575] relative bg-[#f8f8f8]">
        <div className="max-w-[1600px] mx-auto">
          <div className="hidden lg:block absolute top-[14px] right-[14px] z-[1] cursor-pointer bg-white rounded-full pl-4">
            <div
              className="flex items-center gap-3"
              onClick={() => {
                setShowMenu(!showMenu);
              }}
            >
              <span className=""> {user?.full_name} </span>
              <div
                className={`${showMenu && ' border-red-300'
                  } border-2 rounded-full`}
              >
                <div
                  className={`w-[32px] h-[32px] rounded-full bg-[#23DF85] text-white grid place-items-center`}
                >
                  <span className="text-[22px] pointer-events-none select-none font-[400] uppercase">
                    {user?.full_name && user?.full_name?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* mobile start */}
          <div className="lg:hidden">
            <div
              className="fixed h-[65px] top-0 left-0 z-[50] bg-white flex items-center justify-between w-full px-5 py-4 gap-2 font-[600] font-MontserratRegular shadow-[0_2px_4px_#00000026]"
              onClick={() => {
                showMenu && setShowMenu(false);
              }}
            >
              <div className="flex">
                <img alt="" className="w-[36px] h-[36px]" src="/logo.png" />
              </div>
              <div
                className={`${showMenu && ' border-red-300'
                  } border-2 rounded-full`}
              >
                <div
                  className={`w-[32px] h-[32px] rounded-full bg-[#23DF85] text-white grid place-items-center cursor-pointer`}
                  onClick={() => {
                    setShowMenu(!showMenu);
                  }}
                >
                  <span
                    className={`text-[22px] pointer-events-none select-none font-[400] uppercase`}
                  >
                    {user?.full_name && user?.full_name?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-[65px] mb-[150px]">
              <div className="lg:hidden bg-white">
                <div className="flex flex-col gap-[1px]">
                  <div className="border-l-8 border-l-[#23DF85] border-b h-[54px] pr-[20px] pl-3 flex items-center justify-between w-full bg-[#f8f8f8]">
                    <div className="flex items-center gap-[10px]">
                      <img
                        src={userResults?.profile_pic_url}
                        alt=""
                        className="w-[38px] h-[38px] rounded-full"
                      />
                      <div className="flex flex-col">
                        <div className="text-[12px] -mb-1">Account:</div>
                        <div className="text-[14px] text-black font-bold font-MontserratSemiBold">
                          @{userResults?.username}
                        </div>
                      </div>
                    </div>

                    <TbRefresh className="cursor-pointer" onClick={() => { navigate(`/search`) }} />
                  </div>

                  <div className="border-l-8 border-l-[#23DF85] border-b h-[54px] pr-[20px] pl-3 flex items-center justify-between w-full bg-[#f8f8f8]">
                    <div className="flex items-center gap-[10px]">
                      <div className="flex flex-col">
                        <div className="text-[12px] -mb-1">Plan:</div>
                        <div className="text-[14px] text-black font-bold font-MontserratSemiBold">
                          Monthly Plan
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 bg-white px-5">
                <h1 className="text-black text-[20px] font-bold font-MontserratSemiBold">
                  {' '}
                  Start Your Free 7-Day Trial
                </h1>
                <p className="mt-1 mb-3 text-black text-[14px] font-normal">
                  Grow ~1-10k Real & Targeted Followers Every Month. Analytics &
                  Results Tracking. Boost Likes, Comments & DMs. Automated 24/7
                  Growth, Set & Forget. Personal Account Manager. No Fakes Or
                  Bots, 100% Real People.
                </p>

                <div className="mb-[11px] flex gap-[10px] h-[80px] items-center">
                  <div className={`flex-1 bg-[#f8f8f8] rounded-[6px] cursor-pointer h-full relative transition-all duration-100 ease-in ${paymentMethod.name === 'card' && "border-[#1b89ff] border-2"}`}
                    onClick={() => { setPaymentMethod({ id: 1, name: 'card' }) }}
                  >
                    <svgicon
                      className={`${paymentMethod.name === 'card' ? 'top-[13px] left-[10px] w-[22px] h-[18px] translate-x-0 translate-y-0' : 'h-[25.5px] w-[32px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]'}
                        absolute transition-all duration-200 ease-in fill-[#1b89ff] font-[none]`}
                    >
                      <svg
                        viewBox="0 0 28 28"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M0 7C0 6.07174 0.368749 5.1815 1.02513 4.52513C1.6815 3.86875 2.57174 3.5 3.5 3.5H24.5C25.4283 3.5 26.3185 3.86875 26.9749 4.52513C27.6313 5.1815 28 6.07174 28 7V15.75H0V7ZM20.125 8.75C19.8929 8.75 19.6704 8.84219 19.5063 9.00628C19.3422 9.17038 19.25 9.39294 19.25 9.625V11.375C19.25 11.6071 19.3422 11.8296 19.5063 11.9937C19.6704 12.1578 19.8929 12.25 20.125 12.25H23.625C23.8571 12.25 24.0796 12.1578 24.2437 11.9937C24.4078 11.8296 24.5 11.6071 24.5 11.375V9.625C24.5 9.39294 24.4078 9.17038 24.2437 9.00628C24.0796 8.84219 23.8571 8.75 23.625 8.75H20.125ZM0 19.25V21C0 21.9283 0.368749 22.8185 1.02513 23.4749C1.6815 24.1313 2.57174 24.5 3.5 24.5H24.5C25.4283 24.5 26.3185 24.1313 26.9749 23.4749C27.6313 22.8185 28 21.9283 28 21V19.25H0Z"
                          _ngcontent-esd-c92=""
                        ></path>
                      </svg>
                    </svgicon>

                    <div
                      className={`${paymentMethod.name === 'card' ? "opacity-100 translate-y-0 text-[#1b89ff]" : 'opacity-0 translate-y-full'}
                        absolute bottom-[10px] left-[10px] w-[22px] h-[18px] text-[14px] font-[500] transition-all duration-200 ease-in fill-[#1b89ff] font-[none]`}
                    >
                      Card
                    </div>
                  </div>

                  <div className={`flex-1 bg-[#f8f8f8] rounded-[6px] cursor-pointer h-full relative transition-all duration-100 ease-in ${paymentMethod.name === 'paypal' && "border-[#1b89ff] border-2"}`}
                    onClick={() => { setPaymentMethod({ id: 1, name: 'paypal' }) }}
                  >
                    <svgicon
                      className={`${paymentMethod.name === 'paypal' ? 'top-[13px] left-[10px] translate-x-0 translate-y-0' : 'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]'}
                        absolute transition-all duration-200 ease-in fill-[#1b89ff] font-[none]`}
                    >
                      <img src={'/icons/paypal-icon.svg'} alt="" className={`${paymentMethod.name === 'paypal' ? "h-[23.7px]" : "h-[37px]"}`} />
                    </svgicon>

                    <div
                      className={`${paymentMethod.name === 'paypal' ? "opacity-100 translate-y-0 text-[#1b89ff]" : 'opacity-0 translate-y-full'}
                        absolute bottom-[10px] left-[10px] w-[22px] h-[18px] text-[14px] font-[500] transition-all duration-200 ease-in fill-[#1b89ff] font-[none]`}
                    >
                      PayPal
                    </div>
                  </div>
                </div>

                <div className={`${paymentMethod.name === 'card' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'} transition-all duration-150 ease-in`}>
                  <ChargeBeeCard
                    user={user}
                    userResults={userResults}
                    username={username}
                    setIsModalOpen={setIsModalOpen}
                    setErrorMsg={setErrorMsg}
                    mobile={true}
                    Loading={Loading}
                    setLoading={setLoading}
                  />
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full min-h-[85px] p-5 text-[14px] bg-white">
              {paymentMethod.name === 'card' ?
                <div className="">
                  <button
                    className={`${Loading ? 'bg-[#23DF85] cursor-wait' : 'bg-[#1b89ff] cursor-pointer'} w-full h-[50px] rounded-[10px] text-white flex items-center justify-center gap-2`}
                    type="submit"
                    form="cardForm"
                  // onClick={() => { }}
                  >
                    <div className="">{Loading ? "Loading..." : "Pay $0.00 & Start Free Trial"}</div>
                  </button>
                  <div className="text-center mt-2 text-black">
                    Then $24.99 per week, billed monthly. <br /> Cancel any time, no
                    risk.
                  </div>
                </div>
                :
                <div className="">
                  <button
                    className="cursor-pointer w-full h-[50px] rounded-[10px] bg-[#ffc439] text-white flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsModalOpen(true);
                      setErrorMsg({ title: 'Alert', message: 'PayPal not available yet!' })
                    }}
                  >
                    <img src={'/icons/paypal-btn.svg'} alt="" className="h-[25px]" />
                  </button>
                  <div className="text-center mt-2 text-black">
                    Start Free 7-Day Trial. Then $24.99 per week, billed monthly. Cancel any time, no risk.
                  </div>
                </div>
              }

            </div>
          </div>
          {/* mobile end */}

          <div className="">
            <div
              className={`${!showMenu && 'opacity-0 pointer-events-none hidden'
                } absolute top-0 left-0 w-full h-screen z-10`}
            >
              <div
                className="absolute top-0 left-0 w-full h-screen bg-black/0 z-[99] cursor-pointer"
                onClick={() => {
                  setShowMenu(!showMenu);
                }}
              ></div>

              <div
                className={`${!showMenu && 'opacity-0 pointer-events-none hidden'
                  } absolute top-0 lg:top-14 z-[99] left-5 lg:left-[unset] right-5 bg-white w-[calc(100%-40px)] lg:w-[350px] lg:max-w-[400px] rounded-[10px] shadow-[0_5px_10px_#0a17530d] transition-all duration-150 ease-in`}
                ref={parentRef}
                tabIndex={0}
              >
                <div className="flex items-center gap-3 p-5">
                  <div className="w-[50px] h-[50px] rounded-full bg-[#23DF85] text-white grid place-items-center">
                    <span className="text-[22px] pointer-events-none select-none font-[400] uppercase">
                      {user?.full_name && user?.full_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="">
                    <div className="text-black font-bold font-MontserratSemiBold text-[14px]">
                      {user?.full_name}
                    </div>
                    <div className="text-[12px]">{user?.email}</div>
                  </div>
                </div>

                <div
                  className="border-t border-[#f8f8f8] flex items-center gap-3 h-[53px] text-black px-5 cursor-pointer hover:bg-blue-gray-100"
                  onClick={async () => {
                    setShowMenu(!showMenu);
                    await supabase.auth.signOut();
                    window.onbeforeunload = function () {
                      localStorage.clear();
                    };
                    window.location.pathname = '/login';
                  }}
                >
                  <MdLogout size={22} /> <span className="">Logout</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <Content
                user={user}
                userResults={userResults}
                navigate={navigate}
                setIsModalOpen={setIsModalOpen}
                setErrorMsg={setErrorMsg}
                username={username}
                Loading={Loading}
                setLoading={setLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const Content = ({ user, userResults, navigate, setIsModalOpen, setErrorMsg, username, Loading, setLoading }) => {
  const [showCreaditCardInput, setShowCreaditCardInput] = useState(false)

  return (<>
    <div className="h-[calc(100vh-75px)] lg:h-screen mt-[75px] lg:mt-0 lg:py-[20px] lg:px-[100px] bg-[#f8f8f8]">
      <div className="w-full max-w-full lg:max-w-[960px] xl:max-w-[1070px] h-[789px] overflow-auto my-auto 2xl:grid max-h-full lg:mx-auto relative">
        <div className="mb-4 hidden lg:flex items-center gap-2 font-[600] font-MontserratRegular">
          <div className="">Select Your Account</div>
          <div className="">{`>`}</div>
          <div className="text-[#1B89FF]">Complete Setup</div>
          <div className="">{`>`}</div>
          <div className="">Enter Dashboard</div>
        </div>

        <div className="pb-4 hidden lg:flex flex-col justify-between lg:justify-start lg:items-center h-full text-start px-5 lg:px-0">
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <div className="basis-[45%] grow-[3] rounded-[20px] flex gap-5 flex-col">
              <div className="rounded-[20px]">
                <div className="text-start w-full h-[110px] shadow-[0_5px_10px_#0a17530d] rounded-[20px] py-[25px] px-4 lg:px-[50px] relative flex items-center justify-between bg-white">
                  <div className="w-full max-w-[420px] relative overflow-hidden flex items-center text-start py-5 pr-[30px]">
                    <div className="w-full flex gap-4 items-center ">
                      <div className="h-[60px] relative">
                        <img src={userResults?.profile_pic_url} alt="" className='w-[60px] h-[60px] min-w-[60px] min-h-[60px] rounded-full' />
                        <img src="/icons/instagram.svg" alt="" className='absolute -bottom-1 -right-1 border-2 w-[22px] h-[22px] rounded-full' />
                      </div>
                      <div className="">
                        <div className="font-bold text-black">{userResults?.username}</div>
                        <div className="">{userResults?.full_name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[40px] h-[40px] rounded-[10px] grid place-items-center shadow-[0_3px_8px_#0000001a] cursor-pointer bg-[#f8f8f8]" onClick={() => { navigate(`/search`) }}>
                    <TbRefresh className="text-[#8C8C8C] font-semibold" />
                  </div>
                </div>

                <div className="pt-[32px] pb-3 px-5 lg:px-[50px] -mt-5 rounded-bl-[20px] rounded-br-[20px] shadow-[0_3px_8px_#0000001a] bg-[#f8f8f8]">
                  <div className="flex text-[12px]">Select plan</div>
                  <div className="flex font-bold text-black">Monthly Plan</div>
                </div>
              </div>

              <div className="overflow-auto basis-[100%] rounded-[20px] py-10 px-4 lg:px-[50px] shadow-[0_5px_10px_#0a17530d] bg-[#ffffff]">
                <div className="">
                  <div className="flex items-center gap-3">
                    {showCreaditCardInput && <div className="w-[32px] h-[32px] rounded-full grid place-items-center shadow-[0_3px_8px_#0000001a] cursor-pointer bg-[#f8f8f8]" onClick={() => { setShowCreaditCardInput(false) }}>
                      <FaAngleLeft className="text-[#8C8C8C] font-semibold" />
                    </div>}
                    <h1 className="text-[20px] lg:text-[20px] font-bold text-black font-MontserratBold">Payment method</h1>
                  </div>
                  <p className="pt-2 pb-4 text-sm font-MontserratRegular text-start">You may cancel during your free trial and won't be billed, no risk.</p>

                  {!showCreaditCardInput && <div className="flex flex-col gap-4 mb-4">
                    <div className="cursor-pointer w-full h-[60px] rounded-[8px] bg-[#1b89ff] text-white flex items-center justify-center gap-2" onClick={() => { setShowCreaditCardInput(true) }}>
                      <svgicon className="w-[28px] h-[28px] rounded-[8px] fill-white">
                        <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M0 7C0 6.07174 0.368749 5.1815 1.02513 4.52513C1.6815 3.86875 2.57174 3.5 3.5 3.5H24.5C25.4283 3.5 26.3185 3.86875 26.9749 4.52513C27.6313 5.1815 28 6.07174 28 7V15.75H0V7ZM20.125 8.75C19.8929 8.75 19.6704 8.84219 19.5063 9.00628C19.3422 9.17038 19.25 9.39294 19.25 9.625V11.375C19.25 11.6071 19.3422 11.8296 19.5063 11.9937C19.6704 12.1578 19.8929 12.25 20.125 12.25H23.625C23.8571 12.25 24.0796 12.1578 24.2437 11.9937C24.4078 11.8296 24.5 11.6071 24.5 11.375V9.625C24.5 9.39294 24.4078 9.17038 24.2437 9.00628C24.0796 8.84219 23.8571 8.75 23.625 8.75H20.125ZM0 19.25V21C0 21.9283 0.368749 22.8185 1.02513 23.4749C1.6815 24.1313 2.57174 24.5 3.5 24.5H24.5C25.4283 24.5 26.3185 24.1313 26.9749 23.4749C27.6313 22.8185 28 21.9283 28 21V19.25H0Z" ></path>
                        </svg>
                      </svgicon>
                      <div className="">Card / Debit Card</div>
                    </div>
                    <div className="cursor-pointer w-full h-[60px] rounded-[8px] bg-[#ffc439] text-white flex items-center justify-center gap-2" onClick={() => {
                      setIsModalOpen(true);
                      setErrorMsg({ title: 'Alert', message: 'PayPal not available yet!' })
                    }}>
                      <img src={'/icons/paypal-btn.svg'} alt="" className="h-[25px]" />
                    </div>
                  </div>}

                  <div className={`${!showCreaditCardInput ? "opacity-0 pointer-events-none hidden" : 'opacity-100'} transition-all duration-150 ease-out`}>
                    <ChargeBeeCard
                      user={user}
                      userResults={userResults}
                      username={username}
                      setIsModalOpen={setIsModalOpen}
                      setErrorMsg={setErrorMsg}
                      Loading={Loading}
                      setLoading={setLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="basis-[60%] grow-[4] rounded-[20px] shadow-[0_5px_10px_#0a17530d] p-4 lg:p-[50px_50px_50px] bg-white relative">
              <div className="w-full h-full overflow-auto">
                <span className="text-[14px] py-[5px] px-3 mb-3 rounded-[8px] text-[#23df85] bg-[#23df8533]">7-Days Free Trial</span>
                <div className="text-[20px] lg:text-[26px] font-bold text-black font-MontserratBold">Start Your 7-Days Trial</div>
                <p className="text-[14px] mt-2 mb-5">
                  It's time to get the real exposure you've been waiting for. After signing up, you will be introduced to your personal account manager and start growing in under 2 minutes.
                </p>
                <div className="text-[72px] leading-[70px] text-black font-bold font-MontserratBold">Free</div>
                <p className="text-[14px] mb-5">
                  Then $24.99 per week, billed monthly.
                </p>

                <div className="flex flex-col gap-4 text-black text-base">
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" _ngcontent-gsj-c72="" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5" _ngcontent-gsj-c72=""></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5" _ngcontent-gsj-c72=""></rect>
                      </svg>
                    </svgicon>
                    <p className="">Grow ~1-10k Real Monthly Followers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Target Followers Relevant To You</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Detailed Analytics & Results Tracking</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Automated 24/7 Growth, Set & Forget</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>No Fakes Or Bots, 100% Real People</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Personal Account Manager</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Boost Likes, Comments & DMs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Safest Instagram Growth Service</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svgicon className="w-[20px] h-[20px] green-checkbox fill-[#23df85] sroke-green font-[none]">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect opacity="0.2" x="0.5" y="0.5" width="19" height="19" rx="9.5"></rect>
                        <rect x="4.5" y="4.5" width="11" height="11" rx="5.5"></rect>
                      </svg>
                    </svgicon>
                    <p>Access Dashboard On All Devices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>)
}

export const getStartingDay = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + "/" + dd + "/" + yyyy;

  return today
};

export const ChargeBeeCard = ({ user, userResults, addCard, username, setIsModalOpen, setErrorMsg, mobile, Loading, setLoading, setRefresh, refresh }) => {
  const navigate = useNavigate();
  const cardRef = useRef();
  const [nameOnCard, setNameOnCard] = useState('')

  const fonts = [
    'https://fonts.googleapis.com/css?family=Open+Sans'
  ]
  // Style customizations
  const styles = {
    base: {
      color: '#000',
      fontWeight: 600,
      fontFamily: 'Montserrat-Regular, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',

      ':focus': {
        color: '#424770',
      },

      '::placeholder': {
        color: mobile ? '#333' : '#757575',
      },

      ':focus::placeholder': {
        color: '#CFD7DF',
      },
    },
    invalid: {
      color: '#f00',
      ':focus': {
        color: '#FA755A',
      },
      '::placeholder': {
        color: '#FFCCA5',
      },
    },
  }

  const handleAddCard = async () => {
    setLoading(true);
    if (user) {
      if (cardRef) {
        const token = await cardRef.current.tokenize().then(data => {
          return data.token
        }).catch(err => {
          console.log(err);
          alert(err.message)
          // console.log(err?.message);
          if (err === "Error: Could not mount master component") {
            // alert("Please check your card")
            setIsModalOpen(true);
            setErrorMsg({ title: 'Card Error', message: 'Please check your card' })
            setLoading(false);
            return;
          }
          // alert(err)
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: err?.message })
          // alert("something is wrong, please try again")
          setLoading(false);
          return;
        });

        if (!token) {
          setLoading(false);
          return;
        }

        const create_customer_data = {
          customer_id: user?.chargebee_customer_id,
          token_id: token
        }

        let updateCustomerPaymentMethodRes = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/updateCustomerPaymentMethod`,
          urlEncode(create_customer_data))
          .then((response) => response.data).catch(error => {
            console.log(error);
            return { message: 'error', error }
          })

        if (updateCustomerPaymentMethodRes?.message === 'success') {
          setRefresh(!refresh)
          setLoading(false);
          setIsModalOpen(false);
        } else {
          console.log('Error creating customer:', updateCustomerPaymentMethodRes?.error);
          // alert('An error occurred, please try again or contact support')
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: 'An error occurred, please try again or contact support!' })
        }
      }
    } else {
      setIsModalOpen(true);
      setErrorMsg({ title: 'Authentication Error', message: 'You have to login to continue' })
    }
    setLoading(false);
  }

  // const handleCardPay = async (setLoading, userResults, setIsModalOpen, setErrorMsg, user, cardRef, username, navigate, nameOnCard) => {
  const handleCardPay = async () => {
    if (addCard) {
      await handleAddCard()
      return;
    }

    setLoading(true);
    if (userResults?.name === "INVALID_USERNAME") {
      console.log("INVALID_USERNAME")
      setIsModalOpen(true);
      setErrorMsg({ title: 'Alert', message: 'An error has occured, please try again' })
      setLoading(false);
      return;
    };

    if (user) {
      var userIsNew = true
      // const udata = await supabase.from("users").select().eq("username", userResults?.username).eq("email", user?.email);
      // if (udata.data?.[0]?.subscribed) {
      //   setIsModalOpen(true);
      //   setErrorMsg({ title: 'Card Error', message: `You are already subscribed. If you wish to add a new Instagram account, you can do so by changing your username. Alternatively, if you prefer, you can add a new card through accessing the settings on the dashboard.` })
      //   setLoading(false);
      //   return;
      // }else{
      //   if (udata.error){ // means that user authenticated but do not have an account with that email yet
      //     userIsNew=false
      //   }
      // }

      if (cardRef) {
        const token = await cardRef.current.tokenize().then(data => {
          return data.token
        }).catch(err => {
          console.log(err);
          // console.log(err?.message);
          if (err === "Error: Could not mount master component") {
            // alert("Please check your card")
            setIsModalOpen(true);
            setErrorMsg({ title: 'Card Error', message: 'Please check your card' })
            setLoading(false);
            return;
          }
          // alert(err)
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: err?.message })
          // alert("something is wrong, please try again")
          setLoading(false);
          return;
        });

        if (!token) {
          setLoading(false);
          // alert('something is wrong');
          // setIsModalOpen(true);
          // setErrorMsg({ title: 'Alert', message: 'something is wrong' })
          return;
        }

        const create_customer_data = {
          allow_direct_debit: true,
          first_name: user?.full_name,
          // last_name: userResults?.username,
          last_name: '',
          email: user.email,
          token_id: token,
          plan_id: "Monthly-Plan-7-Day-Free-Trial-USD-Monthly"
        }

        let createCustomer = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/create_customer_and_subscription`,
          urlEncode(create_customer_data))
          .then((response) => response.data).catch((err) => {
            // console.log(err);
            setIsModalOpen(true);
            setErrorMsg({ title: 'Alert', message: err?.message })
            setLoading(false);
            return err?.response?.data.err
          })
          
          // console.log(createCustomer);
          // setLoading(false);
          // return

        if (createCustomer.message === 'success') {
          // var profile_pic_url = '';
          // const uploadImageFromURLRes = await uploadImageFromURL(userResults?.username, userResults?.profile_pic_url)

          // if (uploadImageFromURLRes?.status === 'success') {
          //   profile_pic_url = uploadImageFromURLRes?.data
          // }

          let data = {
            nameOnCard,
            chargebee_subscription: JSON.stringify(createCustomer?.result?.subscription),
            chargebee_subscription_id: createCustomer?.result?.subscription?.id,
            chargebee_customer: JSON.stringify(createCustomer?.result?.customer),
            chargebee_customer_id: createCustomer?.result?.customer?.id,

            username: userResults?.username,
            email: user.email,
            full_name: user.full_name,
            followers: userResults?.follower_count,
            following: userResults?.following_count,
            // profile_pic_url,
            is_verified: userResults?.is_verified,
            biography: userResults?.biography,
            start_time: getStartingDay(),
            posts: userResults?.media_count,
            subscribed: true
          }

          if (userIsNew) {
            if (!user) {
              setIsModalOpen(true);
              setErrorMsg({ title: 'Alert', message: `Error updating user's details` })
              setLoading(false);
              return;
            }
            console.log({user});
            const updateUser = await supabase
              .from("users")
              .update(data).eq('id', user.id);
            if (updateUser?.error) {
              console.log(updateUser.error);
              setIsModalOpen(true);
              setErrorMsg({ title: 'Alert', message: `Error updating user's details` })
              
              return;
            }
          } else {
            const addAccount = await supabase.from("users").insert({ ...data, user_id : user.id});
            if (addAccount?.error) {
              console.log(addAccount.error);
              setIsModalOpen(true);
              setErrorMsg({ title: 'Alert', message: `Error adding new account` })
            }
          }

          const ref = getRefCode()
          // console.log('success');
          if (ref) {
            navigate(`/thankyou?ref=${ref}`)
          } else {
            navigate(`/thankyou`)
          }
          setLoading(false);

        } else {
          console.log('Error creating customer:', createCustomer);
          // alert('An error occurred, please try again or contact support')
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: 'An error occurred, please try again or contact support!' })
          setLoading(false);
        }

        // const create_customer_data = {
        //   allow_direct_debit: true,
        //   // first_name: userResults?.full_name,
        //   first_name: user?.full_name,
        //   last_name: '',
        //   email: user.email,
        //   token_id: token
        // }

        // let customer = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/create_customer`,
        //   urlEncode(create_customer_data))
        //   .then((response) => response.data).catch(error => {
        //     console.log(error);
        //     return {message: 'error', error}
        //   })

        // if (customer.message === 'success') {
        //   var profile_pic_url = '';
        //   const create_subscription_for_customer_data = {
        //     customer_id: customer?.customer?.id,
        //     plan_id: "Monthly-Plan-7-Day-Free-Trial-USD-Monthly"
        //     // plan_id: "Free-Trial-USD-Monthly" //Monthly-Plan-USD-Monthly
        //     // plan_id: "Monthly-Plan-USD-Monthly"
        //   }
        //   let subscriptionResult = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/create_subscription_for_customer`,
        //     urlEncode(create_subscription_for_customer_data))
        //     .then((response) => response.data)
        //   // console.log(subscriptionResult);
        //   if (subscriptionResult.message === 'success') {
        //     const uploadImageFromURLRes = await uploadImageFromURL(username, userResults?.profile_pic_url)
        //     // console.log(uploadImageFromURLRes);

        //     if (uploadImageFromURLRes?.status === 'success') {
        //       profile_pic_url = uploadImageFromURLRes?.data
        //     }

        //     let data = {
        //       nameOnCard,
        //       chargebee_subscription: JSON.stringify(subscriptionResult.subscription),
        //       chargebee_subscription_id: subscriptionResult.subscription?.id,
        //       chargebee_customer: JSON.stringify(customer.customer),
        //       chargebee_customer_id: customer?.customer?.id,

        //       username,
        //       email: user.email,
        //       followers: userResults?.follower_count,
        //       following: userResults?.following_count,
        //       // profile_pic_url: userResults?.profile_pic_url,
        //       profile_pic_url,
        //       is_verified: userResults?.is_verified,
        //       biography: userResults?.biography,
        //       start_time: getStartingDay(),
        //       posts: userResults?.media_count,
        //       subscribed: true,
        //     }

        //     const updateUser = await supabase
        //       .from("users")
        //       .update(data).eq('id', user.id);
        //     if (updateUser.error) {
        //       console.log(updateUser.error);
        //       setIsModalOpen(true);
        //       setErrorMsg({ title: 'Alert', message: `Error updating user's details` })
        //     }
        //     const ref = getRefCode()
        //     console.log('success');
        //     if (ref) {
        //       navigate(`/thankyou?ref=${ref}`)
        //     } else {
        //       navigate(`/thankyou`)
        //     }
        //     setLoading(false);
        //   } else {
        //     console.log('Error creating subscription:', subscriptionResult.error);
        //     // alert('An error occurred, please try again or contact support')
        //     setIsModalOpen(true);
        //     setErrorMsg({ title: 'Alert', message: 'An error occurred, please try again or contact support!' })
        //   }
        // } else {
        //   console.log('Error creating customer:', customer.error);
        //   // alert('An error occurred, please try again or contact support')
        //   setIsModalOpen(true);
        //   setErrorMsg({ title: 'Alert', message: 'An error occurred, please try again or contact support!' })
        // }
      }
    } else {
      setIsModalOpen(true);
      setErrorMsg({ title: 'Authentication Error', message: 'You have to login to continue' })
    }
    setLoading(false);
  };

  return (<>
    <div className={`ex1-field shadow-[0_2px_4px_#00000026] rounded-[8px] px-5 py-6 text-sm ${mobile ? 'placeholder-[#333]' : 'placeholder-[#757575]'} bg-[#f8f8f8] font-[500] transition-all duration-280 ease mb-5`} id='num'>
      <input type="text" className="w-full bg-transparent outline-none border-none" placeholder="Name on Card" value={nameOnCard}
        // onFocus={(e) => { console.log(e) }} onBlur={(e) => { console.log(e) }}
        onChange={(e) => { setNameOnCard(e.target.value) }} />
      {/* <label className="ex1-label font-MontserratLight">Card Number</label><i className="ex1-bar"></i> */}
    </div>

    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (Loading) {
          // alert('Please wait');
          setIsModalOpen(true);
          setErrorMsg({ title: 'Processing...', message: 'Please wait' })
          return
        }
        // await handleCardPay(setLoading, userResults, setIsModalOpen, setErrorMsg, user, cardRef, username, navigate, nameOnCard);
        await handleCardPay();
      }}
      id="cardForm">

      <CardComponent
        ref={cardRef}
        className="fieldset field"
        onChange={() => { }}
        styles={styles}
        locale={'en'}
        placeholder={'placeholder'}
        fonts={fonts}
      >
        <div className="ex1-field shadow-[0_2px_4px_#00000026] rounded-[8px] px-5 py-6 text-sm bg-[#f8f8f8] font-[500] transition-all duration-280 ease mb-5" id='num'>
          <CardNumber className="ex1-input"
            // onFocus={(e) => { console.log(e) }} onBlur={(e) => { console.log(e) }}
            onChange={(e) => { }} />
          {/* <label className="ex1-label font-MontserratLight">Card Number</label><i className="ex1-bar"></i> */}
        </div>

        <div className="ex1-fields flex items-center gap-4 mb-5">
          <div className="ex1-field w-full shadow-[0_2px_4px_#00000026] rounded-[8px] px-5 py-6 text-sm bg-[#f8f8f8] font-[500] transition-all duration-280 ease">
            <CardExpiry className="ex1-input"
              // onFocus={(e) => { console.log(e) }} onBlur={(e) => { console.log(e) }}
              onChange={(e) => { }} />
            {/* <label className="ex1-label font-MontserratLight">Expiry</label><i className="ex1-bar"></i> */}
          </div>

          <div className="ex1-field w-full shadow-[0_2px_4px_#00000026] rounded-[8px] px-5 py-6 text-sm bg-[#f8f8f8] font-[500] transition-all duration-280 ease">
            <CardCVV className="ex1-input"
              // onFocus={(e) => { console.log(e) }} onBlur={(e) => { console.log(e) }}
              onChange={(e) => { }} />
            {/* <label className="ex1-label font-MontserratLight">CVC</label><i className="ex1-bar"></i> */}
          </div>
        </div>
      </CardComponent>
    </form>

    <div className={`${addCard ? "block" : "hidden lg:block"}`}>
      <button className={`${Loading ? 'bg-[#23DF85] cursor-wait' : 'bg-[#1b89ff] cursor-pointer'} text-white font-MontserratSemiBold text-[.8rem] xl:text-[1.125rem] ${addCard ? "mt-[65px]" : "mt-5"} w-full py-4 rounded-[10px] font-[600] mb-4`}
        onClick={() => {
          if (Loading) {
            setIsModalOpen(true);
            setErrorMsg({ title: 'Processing...', message: 'Please wait' })
            return
          }
          // await handleCardPay(setLoading, userResults, setIsModalOpen, setErrorMsg, user, cardRef, username, navigate, nameOnCard);
          handleCardPay();
        }}>
        <span> {Loading ? "Processing..." : `${addCard ? "Add Payment Method" : "Pay $0.00 & Start Free Trial"}`}  </span>
      </button>
      {/* {showCardComponent && <></>} */}
      {Loading && <div className="flex items-center py-3 gap-2 justify-center">
        <AiOutlineLoading3Quarters className="animate-spin" />
        <p className="font-[500] text-xs md:text-sm font-MontserratSemiBold text-[#333] animate-pulse">
          We're processing your request, please wait...
        </p>
      </div>}
    </div>
  </>)
}