import Axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useClickOutside } from "react-click-outside-hook";

import { Spinner } from 'react-bootstrap'
import { TiTimes } from 'react-icons/ti'
import { FaAngleRight, FaUser } from 'react-icons/fa'
import { getAccount, getRefCode, searchAccount } from '../../helpers'
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function OnboardingSearchBox() {
  const [parentRef, isClickedOutside] = useClickOutside();
  const [loadingSpinner, setLoadingSpinner] = useState(false)
  const [processing, setProcessing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false)
  const [input, setInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(input)
  const [searchedAccounts, setSearchedAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState()
  const [selected, setSelected] = useState()
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
    setSearchedAccounts([])
    fetch()
  }, [input])

  const handleSubmit = async () => {
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
          "X-RapidAPI-Key": "47e2a82623msh562f6553fe3aae6p10b5f4jsn431fcca8b82e",
          "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
        },
      };
      console.log(options);
      const userResults = await Axios.request(options);
      console.log(userResults?.data[0]?.username);
      if (!userResults?.data[0]?.username) return alert('Username not found!');
      const { data: { user } } = await supabase.auth.getUser()

      await supabase
        .from("users")
        .update({
          username: userResults.data[0].username,
        }).eq('user_id', user.id);
      // window.location = `/subscriptions/${userResults.data[0].username}`;
      const ref = getRefCode()
      if (ref) {
        navigate(`/subscriptions/${userResults.data[0].username}?ref=${ref}`)
      } else {
        navigate(`/subscriptions/${userResults.data[0].username}`)
      }
      return;
    } else {
      setProcessing(false);
      alert('choose your account');
    }
  };

  return (<>
    <div className="flex flex-col items-center w-full h-[calc(100vh-200px)] lg:h-fit lg:w-[411px] relative" ref={parentRef}>
      <div className={`w-full lg:w-[411px] ${selected ? 'h-[100px]' : 'h-[62px]'} transition-[all_.3s_ease-in]`}>
        {selected && <div className={`py-[30px] px-5 h-full flex items-center justify-between border rounded-[10px] shadow-[0_0_4px_#00000040] bg-[#f8f8f8]`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={selectedAccount?.profile_pic_url} alt="" className='w-[60px] h-[60px] rounded-full' />
              <img src="/icons/instagram.svg" alt="" className='absolute -bottom-1 -right-1 border-2 w-[22px] h-[22px] rounded-full' />
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

        {!selected && <div className={`p-5 h-full flex items-center border border-black text-black rounded-[10px]`}>
          <input
            type="text"
            className="w-full outline-none placeholder-black/75"
            placeholder="@username"
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
            <span className="absolute z-10">{loadingSpinner && (<>
              <Spinner animation="border" />
            </>)}</span>
            {input && <TiTimes className='cursor-pointer' onClick={() => { setDebouncedQuery(''); setSearchedAccounts([]) }} />}
          </div>
        </div>}
      </div>

      {showResultModal && !selected && !processing && <div className="absolute top-[64px] z-50 w-full h-[300px] overflow-auto shadow-md border rounded-md bg-white py-3 px-4 flex flex-col gap-4">
        {/* {showResultModal && debouncedQuery && !processing && <div className="absolute top-[60px] z-50 w-full h-fit overflow-auto shadow-md border rounded-md bg-white py-3 px-4 flex flex-col gap-4"> */}
        {debouncedQuery && <div className="flex items-center gap-2 border-b pb-2 cursor-pointer"
          onClick={async () => {
            const a = await getAccount(debouncedQuery)
            if (a?.data?.[0]?.username) {
              setSelected(a?.data?.[0]?.username);
              setSelectedAccount(a?.data?.[0]);
            }else{
              alert('username not found!')
            }
            // setInput(debouncedQuery)
            setLoadingSpinner(false)
            setShowResultModal(false);
          }}
        >
          <div className="p-3 rounded-full bg-black">
            <FaUser size={14} color="white" />
          </div>
          <div className="">
            <div className="">{debouncedQuery}</div>
            <div className="mt-1 opacity-40 text-[.9rem]">click here to open account profile</div>
          </div>
        </div>}
        {searchedAccounts.map((data, index) => {
          return (<>
            <div
              key={index}
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
                <p>{data.username}</p>
                <span className="opacity-40">{data.full_name}</span>
              </div>
            </div>
          </>)
        })}
      </div>}

      <button className={`${selected ? 'bg-[#ef5f3c]' : 'bg-[#C4C4C4]'} mt-[40px] w-full lg:w-[350px] h-[60px] py-[15px] rounded-[10px] text-[1.125rem] font-semibold text-white ${processing && 'cursor-wait bg-[#ffa58e]'} absolute lg:static bottom-5`}
        onClick={() => { (selected && !processing) && handleSubmit() }}
      >{processing ? <span className="animate-pulse">Processing your account…</span> : <div className='flex items-center justify-center gap-2'>Select Account <FaAngleRight size={25} /></div>}</button>
    </div>
  </>)
}
