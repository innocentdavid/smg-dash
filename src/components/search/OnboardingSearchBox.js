import Axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useClickOutside } from "react-click-outside-hook";

import { Spinner } from 'react-bootstrap'
import { TiTimes } from 'react-icons/ti'
import { FaAngleRight, FaUser } from 'react-icons/fa'
import { getAccount, getRefCode, searchAccount, uploadImageFromURL } from '../../helpers'
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../AlertModal';
import axios from 'axios';
import { getStartingDay } from '../Subscriptions';
import { useTranslation } from 'react-i18next';
import { BACKEND_URL, X_RAPID_API_HOST, X_RAPID_API_KEY } from '../../config';

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

export default function OnboardingSearchBox({ user, currentUsername }) {
  const {t} = useTranslation()
  const [parentRef, isClickedOutside] = useClickOutside();
  const [loadingSpinner, setLoadingSpinner] = useState(false)
  const [processing, setProcessing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false)
  const [input, setInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(input)
  const [searchedAccounts, setSearchedAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState()
  const [selected, setSelected] = useState()
  const [errorMsg, setErrorMsg] = useState({ title: 'Alert', message: 'something went wrong' })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef()
  const navigate = useNavigate();

  useEffect(() => {
    if (isClickedOutside) {
      setShowResultModal(false)
    };
  }, [isClickedOutside]);

  useEffect(() => {
    var i = debouncedQuery;
    if (debouncedQuery.startsWith('@')) {
      i = debouncedQuery.substring(1)
    }
    const timer = setTimeout(() => setInput(i), 1000);
    return () => clearTimeout(timer)
  }, [debouncedQuery]);

  useEffect(() => {
    const fetch = async () => {
      if (input) {
        setLoadingSpinner(true)
        const data = await searchAccount(input);
        const users = data?.users;
        if (users?.length > 0) {
          const filtered = users?.filter(user => {
            var x = (user?.username)?.toLowerCase()
            var y = input?.toLowerCase()
            return x?.startsWith(y)
          })
          // console.log(filtered);
          setSearchedAccounts(filtered)
          setShowResultModal(true)
        }
        setLoadingSpinner(false)
      }
    }
    setSearchedAccounts([])
    fetch()
  }, [input])

  const handleSubmit = async () => {
    if (!user?.user_id) {
      alert('please login first')
    }

    var filteredSelected = selected;
    if (filteredSelected.startsWith('@')) {
      filteredSelected = filteredSelected.substring(1)
    }

    if (selected) {
      setProcessing(true);
      const params = { ig: filteredSelected, response_type: "short", corsEnabled: "false", storageEnabled: "true" };
      // const params = { ig: filteredSelected, response_type: "short", corsEnabled: "false" };
      const options = {
        method: "GET",
        url: "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile",
        params,
        headers: {
          "X-RapidAPI-Key": X_RAPID_API_KEY,
          "X-RapidAPI-Host": X_RAPID_API_HOST,
        },
      };
      const userResults = await Axios.request(options);
      const vuser = userResults?.data?.[0]

      if (!vuser?.username) {
        // alert('Username not found!');
        setIsModalOpen(true);
        setErrorMsg({ title: 'Alert', message: 'Username not found!' })
        setProcessing(false);
        return
      }

      const checkUsername = await supabase.from("users").select().eq('email', user?.email).eq("username", vuser?.username)
      if (checkUsername.data?.[0]) {
        const ref = getRefCode()
        if (ref) {
          navigate(`/subscriptions/${checkUsername.data[0].username}?ref=${ref}`)
        } else {
          navigate(`/subscriptions/${checkUsername.data[0].username}`)
        }
        return;
      }

      var profile_pic_url = '';
      const uploadImageFromURLRes = await uploadImageFromURL(vuser?.username)

      if (uploadImageFromURLRes?.status === 'success') {
        profile_pic_url = uploadImageFromURLRes?.data ?? ''
      }

      if (!currentUsername) {
        const updateUser = await supabase
          .from("users")
          .update({
            username: vuser?.username,
            profile_pic_url
          }).eq("user_id", user?.user_id).eq("username", user?.username);
        // window.location = `/subscriptions/${userResults.data[0].username}`;
        if (!updateUser.error) {
          const ref = getRefCode()
          if (ref) {
            navigate(`/subscriptions/${userResults.data[0].username}?ref=${ref}`)
          } else {
            navigate(`/subscriptions/${userResults.data[0].username}`)
          }
          return;
        } else {
          console.log(updateUser?.error)
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: updateUser?.error?.message })
          setProcessing(false);
          return;
        }
      } else {        
        if (!user?.customer_id) {
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: 'No CB_ID found' })
          setProcessing(false);
          return;
        }
        
        let data = {
          customer_id: user?.customer_id,
          plan_id: "Monthly-Plan-7-Day-Free-Trial-USD-Monthly"
        }
        let createSubscription = await axios.post(`${BACKEND_URL}/api/create_subscription`,
          urlEncode(data))
          .then((response) => response.data).catch((err) => {
            // console.log(err);
            setIsModalOpen(true);
            setErrorMsg({ title: 'Alert', message: err?.message })
            setProcessing(false);
            return err?.response?.data.err
          })

        if (createSubscription.message === 'success') {
          const data = {
            ...user,
            username: vuser?.username,
            followers: vuser?.follower_count,
            following: vuser?.following_count,
            is_verified: vuser?.is_verified,
            biography: vuser?.biography,
            posts: vuser?.media_count,
            profile_pic_url,
            start_time: getStartingDay(),
            chargebee_subscription: JSON.stringify(createSubscription?.result?.subscription),
            chargebee_subscription_id: createSubscription?.result?.subscription?.id,
            status: 'pending',
            userMode: 'auto',
            first_account: false
          }
          delete data.id
          delete data.created_at
          delete data.targetingFilter
          delete data.profile
          delete data.total_interactions
          delete data.backupcode
          delete data.messageSender
          delete data.msg
          // console.log(data);
          const addUser = await supabase.from("users").insert(data);

          if (!addUser.error) {
            navigate(`/dashboard/${vuser?.username}`)
            return;
          } else {
            console.log(addUser?.error)
            setIsModalOpen(true);
            setErrorMsg({ title: 'Alert', message: addUser?.error?.message })
            setProcessing(false);
            return;
          }
        } else {
          // console.log(createSubscription)
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: "An error occured, please try again or contact support" })
          setProcessing(false);
          return;
        }

      }
    } else {
      setProcessing(false);
      alert('choose your account');
    }
  };

  return (<>
    <AlertModal
      isOpen={isModalOpen}
      onClose={() => { setIsModalOpen(false) }}
      title={errorMsg?.title}
      message={errorMsg?.message}
    />

    <div className="h-[calc(100vh-75px)] lg:h-screen mt-[75px] lg:mt-0 lg:py-[60px] 2xl:py-[100px] lg:px-[100px] bg-black">
      <div className="w-full max-w-full lg:max-w-[960px] xl:max-w-[1070px] h-[789px] my-auto 2xl:grid max-h-full lg:mx-auto relative rounded-[20px] shadow-[0_5px_10px_#0a17530d] bg-[#242424]">
        <div className="absolute -top-10 left-0 hidden lg:flex items-center gap-2 font-[600] ">
          <div className="text-[#3d3d3d]">{t("Select Your Account")}</div>
          <div className="">{`>`}</div>
          <div className="">{t("Complete registration")}</div>
          <div className="">{`>`}</div>
          <div className="">{t("Go to your dashboard")}</div>
        </div>

        <div className="flex flex-col justify-between h-full px-5 pb-4 lg:justify-center lg:items-center text-start lg:text-center lg:px-0">
          <div className="block lg:flex flex-col lg:justify-center lg:items-center pt-6 md:pt-0 pb-[80px]">
            <h1 className='font-bold text-black-r  text-[26px] pb-3'>{t("Search your account")}</h1>
            <p className='text-[0.875rem]  lg:px-[100px]'>{t("search_acc_text")} <br className='hidden lg:block' />SocialMediaGains</p>

            <div className="flex flex-col justify-between mt-3 lg:block">
              <div className="flex flex-col items-center justify-between h-full w-full lg:h-fit lg:w-[411px] relative" ref={parentRef}>
                <div className={`w-full lg:w-[411px] ${selected ? 'h-[100px]' : 'h-[62px]'} transition-all duration-300 ease-in`}>
                  {selected && <div className={`py-[30px] px-5 lg:px-7 h-full flex items-center justify-between border rounded-[10px] shadow-[0_0_4px_#1C1A2640] bg-[#f8f8f8] text-black`}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={selectedAccount?.profile_pic_url} alt="" className='w-[60px] h-[60px] rounded-full' />
                        <img src="/icons/instagram.svg" alt="" className='absolute -bottom-1 -right-1 border-2 w-[22px] h-[22px] rounded-full' />
                      </div>
                      <div className="">
                        <h3 className='font-bold text-black-r '>{selectedAccount?.username}</h3>
                        <h3 className=''>{selectedAccount?.full_name}</h3>
                      </div>
                    </div>
                    <img src="/icons/change_account.svg" alt="" className='w-[40px] h-[40px] cursor-pointer' onClick={() => {
                      setDebouncedQuery('');
                      setSearchedAccounts([]);
                      setSelected();
                      setSelectedAccount();
                      setShowResultModal(false)
                    }} />
                  </div>}

                  {!selected && <div className={`p-5 h-full flex items-center border border-black text-black-r rounded-[10px]`}>
                    <input
                      type="text"
                      className="w-full placeholder-white bg-transparent outline-none"
                      placeholder={`@${t("username")}`}
                      value={debouncedQuery}
                      ref={inputRef}
                      onChange={(e) => {
                        setDebouncedQuery(e.target.value);
                        setShowResultModal(true)
                      }}
                    // onFocus={() => {
                    //   setShowResultModal(true)
                    // }}
                    />
                    <div className="relative flex items-center justify-center">
                      <span className="mt-1">{loadingSpinner && (<>
                        <Spinner animation="border" />
                      </>)}</span>
                      {input && <TiTimes className='cursor-pointer absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]' onClick={() => { setDebouncedQuery(''); setSearchedAccounts([]) }} />}
                    </div>
                  </div>}
                </div>

                {showResultModal && !selected && !processing && <div className="absolute top-[64px] z-50 w-full min-h-[150px] max-h-[300px] overflow-auto shadow-md border borderD-[#dbc8be] rounded-md bg-black py-3 px-4 flex flex-col gap-4">
                  {debouncedQuery && <div className="flex items-center gap-2 pb-2 border-b cursor-pointer"
                    onClick={async () => {
                      setProcessing(true)
                      const a = await getAccount(debouncedQuery)
                      setProcessing(false)
                      if (a?.data?.[0]?.username) {
                        setSelected(a?.data?.[0]?.username);
                        setSelectedAccount(a?.data?.[0]);
                      } else {
                        // alert('username not found!')
                        setIsModalOpen(true);
                        setErrorMsg({ title: 'Alert', message: 'username not found!' })
                      }
                      // setInput(debouncedQuery)
                      setLoadingSpinner(false)
                      setShowResultModal(false);
                    }}
                  >
                    <div className="p-3 text-black bg-white rounded-full">
                      <FaUser size={14} />
                    </div>
                    <div className="">
                      <div className="flex">{debouncedQuery}</div>
                      <div className="flex mt-1 opacity-40 text-[.9rem]">{t("click here to open account profile")}</div>
                    </div>
                  </div>}
                  {searchedAccounts.map((data, index) => {
                    return (<>
                      <div
                        key={`searchedAccounts-${index+1}`}
                        className='accounts w-full flex items-center cursor-pointer hover:bg-[#02a1fd]/20'
                        onClick={() => {
                          setDebouncedQuery(data?.username)
                          setSelected(data?.username);
                          setSelectedAccount(data)
                          // setInput(data?.username)
                          setLoadingSpinner(false)
                          setShowResultModal(false);
                        }}
                      >
                        <img
                          alt=''
                          src={data.profile_pic_url}
                          style={{
                            height: '40px',
                            marginRight: '10px',
                            width: '40px',
                            borderRadius: '9999px'
                          }}
                        />
                        <div className="flex flex-col" id={data.username}>
                          <p className='flex'>{data.username}</p>
                          <span className="flex opacity-40">{data.full_name}</span>
                        </div>
                      </div>
                    </>)
                  })}
                </div>}

                <button className={`${selected ? 'button-gradient2' : 'bg-[#C4C4C4]'} hidden lg:block mt-[40px] w-full lg:w-[350px] h-[60px] py-[15px] rounded-[10px] text-[1.125rem] font-semibold text-white ${processing && 'cursor-wait bg-[#ffa58e]'}`}
                  onClick={() => { (selected && !processing) && handleSubmit() }}
                >
                  {processing ? <span className="animate-pulse">{t("Processing your account")}…</span> : <div className='flex items-center justify-center gap-2'>{t("Select Account")} <FaAngleRight size={25} /></div>}
                </button>
              </div>
            </div>
          </div>

          <div className="fixed left-0 w-full px-5 bottom-6">
            <button className={`${selected ? 'button-gradient2' : 'bg-[#C4C4C4]'} lg:hidden w-full lg:w-[350px] h-[50px] py-[15px] rounded-[10px] text-[.8rem] font-semibold text-white ${processing && 'cursor-wait bg-[#ffa58e]'}`}
              onClick={() => { (selected && !processing) && handleSubmit() }}
            >
              {processing ? <span className="animate-pulse">{t("Processing your account")}…</span> : <div className='flex items-center justify-center gap-2'>{t("Select Account")} <FaAngleRight size={20} /></div>}
            </button>
          </div>
        </div>
      </div>
    </div>

  </>)
}
