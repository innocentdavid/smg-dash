/* eslint-disable */
import React, { useEffect, useState } from "react";
import Modal from "react-modal"
import { supabase } from "../supabaseClient";
import { countDays, deleteAccount, getAccount, numFormatter, searchAccount } from "../helpers";
import avatarImg from "../images/avatar.svg"
import { ImBin2 } from "react-icons/im"
import { BsFillPlusSquareFill } from "react-icons/bs"
import ModalAdd from "../components/ModalAdd"
import { Spinner } from "react-bootstrap";
import UserCard from "./userCard";

Modal.setAppElement('#root');

export default function Whitelist({ userId }) {
  const [whitelistAccounts, setWhitelistAccounts] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [selectAccountName, setSelectedAccountName] = useState("");
  const [searchAccounts, setSearchAccounts] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // const insertWhitelist = async () => {
  //   setLoading(true);
  //   if (selectAccountName.length > 0) {
  //     const theAccount = await getAccount(selectAccountName);
  //     const { error } = await supabase.from("whitelist").insert({
  //       account: selectAccountName,
  //       followers: theAccount.data[0].follower_count,
  //       avatar: theAccount.data[0].profile_pic_url,
  //       user_id: userId,
  //     });
  //     console.log(
  //       "🚀 ~ file: Whitelist.jsx:33 ~ const{error}=awaitsupabase.from ~ error",
  //       error
  //     );

  //     setAccountName("");
  //     setSelectedAccountName("");
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (accountName.length > 0) {
      setLoadingSpinner(true)
      const getData = async () => {
        const data = await searchAccount(accountName);
        setSearchAccounts(data.data[0].users);
        setLoadingSpinner(false)

      };
      getData();
    }
  }, [accountName, addSuccess]);

  useEffect(() => {
    const getWhitelistedAccounts = async () => {
      setLoadingSpinner(true)
      const { data, error } = await supabase
        .from("whitelist")
        .select()
        .eq("user_id", userId)
        .order('id', { ascending: false });
      console.log(
        "🚀 ~ file: Whitelist.jsx:55 ~ getWhitelistedAccounts ~ error",
        error
      );
      setWhitelistAccounts(data);
      setLoadingSpinner(false)
    };

    getWhitelistedAccounts();
  }, [userId, selectAccountName, addSuccess]);

  const subtitle = "Add users you wish to continue following that were followed by us. We will never unfollow anyone you manually followed."
  const extraSubtitle = "If you wish to continue following a user that we automatically followed for you, add them here and we won’t unfollow them. Remember, we will never unfollow anyone you manually followed before or after using our service - this only applies to users we followed for you."

  return (
    <div>
      <ModalAdd
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        title="Add to a Whitelist"
        from='whitelist'
        subtitle={subtitle}
        extraSubtitle={extraSubtitle}
        userId={userId}
        setAddSuccess={setAddSuccess}
        addSuccess={addSuccess}
      />

      <div className="shadow-targeting my-12">
        {/* nav */}
        <div className="flex justify-between px-8 pt-8">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-[28px] font-MontserratBold">Whitelist</h3>
            <div className="bg-gray20 rounded w-8 h-8 flex justify-center items-center">
              <h2 className="text-white font-MontserratSemiBold">{whitelistAccounts.length}</h2>
            </div>
            {loadingSpinner && (<Spinner animation="border" />)}
          </div>
          <div className="rounded-[4px] bg-[#D9D9D9] p-3 relative w-10 h-10 cursor-pointer" onClick={() => { setIsOpen(!modalIsOpen) }}>
            <BsFillPlusSquareFill className="absolute text-[#8C8C8C] font-semibold" />
          </div>
        </div>
        {/* body */}
        <div className="grid p-5 md:p-8 gap-4">
          {whitelistAccounts.map((item, index) => {
            return (
              <UserCard key={`whitelist_${index}`} item={item} setAddSuccess={setAddSuccess} addSuccess={addSuccess} from="whitelist" />
            );
          })}
        </div>
      </div>
    </div>
  );
}
