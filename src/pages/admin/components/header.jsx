import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshModal } from '../../../dashboard'
import { supabase } from '../../../supabaseClient'

export default function Header({ setUsers, setLoading }) {
    const [openRefreshModal, setOpenRefreshModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const hangleSearch = async () => {
        var searchString = searchTerm
        if (!searchString) return;
        setLoading(true)
        var column;
        if (searchString.startsWith("@")){
            column = 'username'
            searchString = searchTerm.substring(1);
        } else if (searchString.includes("@")){
            column = 'email'
        }else {
            column = 'chargebee_customer_id'
        }
        
        const res = await supabase
            .from('users')
            .select()
            .like(column, `%${searchString}%`)

        // error && console.log(error);
        res.error && console.log(res.error);
        // if(error) return;
        if (res.error) return;
        
        setUsers(res.data)
        setLoading(false)
    }

    return (
        <div className="">
            {openRefreshModal && <RefreshModal openRefreshModal={openRefreshModal} setOpenRefreshModal={setOpenRefreshModal} />}

            <nav className="flex justify-between items-center">
                <Link to={"/"} className="navbar-brand" href="#">
                    <div className="font-MADEOKINESANSPERSONALUSE text-[20px] md:text-[25px]">
                        <img alt="" className="md:hidden w-[36px] h-[36px]" src="/logo.png" />
                        <img src="/sproutysocial-light.svg" alt="" className="hidden md:inline  w-[346px]" />
                    </div>
                </Link>

                <div className="flex justify-end items-center text-[18px] font-semibold font-MontserratSemiBold tracking-[-0.36px]">
                    <button className="rounded-[10px] bg-black text-white w-[203px] h-[59px]" onClick={() => setOpenRefreshModal(!openRefreshModal)}>Refresh Account</button>
                    <button className="rounded-[10px] bg-black text-white w-[203px] h-[59px] ml-5" onClick={async () => {
                        await supabase.auth.signOut();
                        window.onbeforeunload = function () {
                            localStorage.clear();
                        }
                        window.location.pathname = "/login";
                    }}>Log Out</button>
                </div>
            </nav>

            <form className="h-[82px] w-full rounded-[10px] border shadow-[0px_0px_5px_0px_#E7E7E7] flex items-center px-[28px] py-[23px] mt-[22px]" onSubmit={(e) => { e.preventDefault(); hangleSearch() }}>
                <button type='submit' className="w-[40px] h-[40px] grid place-items-center rounded-[10px] bg-black">
                    <img src="/icons/user-search.svg" alt="" className="w-[24px] h-[24px]" />
                </button>
                <input
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value) }}
                    type="text" className="placeholder-[#C4C4C4] text-[#363636] outline-none border-none ml-5 w-full" placeholder='Search by @account, email or CB Customer ID' />
            </form>
        </div>
    )
}