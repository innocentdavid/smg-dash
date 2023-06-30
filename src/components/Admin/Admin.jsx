import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { updateUserProfilePicUrl } from "../../helpers";
import { supabase } from "../../supabaseClient";
import Nav from "../Nav";
import axios from "axios";

export default function Admin() {
  const [files, setFiles] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);

  let receipts = [];
  let receiptsRead = [];
  let currentReceipt = null;
  var list = []

  const receiptReader = new FileReader();
  receiptReader.onloadend = (e) => {
    // const loadSucceeded = (e.error === undefined) ? true : false;
    // console.log(`${currentReceipt.name}: ${e.loaded} of ${e.total} loaded. success: ${loadSucceeded}`);
    const data = JSON.parse(e.target.result)
    list.push({ data, username: data?.[0]?.args?.username })
    receiptsRead.push(currentReceipt);
    readNextReceipt();
  };

  function readNextReceipt() {
    if (receiptsRead.length < receipts.length) {
      currentReceipt = receipts[receiptsRead.length];
      // receiptReader.readAsArrayBuffer(currentReceipt);
      receiptReader.readAsText(currentReceipt, "UTF-8");
    } else {
      // console.log('All receipts have been read.');
      setReading(false)
      setFiles(list);
    }
  }

  const handleChange = e => {
    setReading(true)
    receipts = e.target.files;
    receiptsRead = [];

    console.log('Reading receipts...');
    readNextReceipt();
  };


  const handleUploadSessionFile = async () => {
    setLoading(true);
    await files.reduce(async (ref, file) => {
      await ref;
      const username = file?.username
      try {
        const data = file?.data
        let lastItem = data[data?.length - 1];

        const updateUser = await supabase
          .from("users")
          .update({
            followers: lastItem.profile.followers,
            following: lastItem.profile.following,
            posts: lastItem.profile.posts,
            total_interactions: lastItem.total_interactions
          }).eq('username', username);

        updateUser.error && console.log(updateUser.error);
      } catch (error) {
        console.log(error);
      }

      const { error } = await supabase
        .from("sessions")
        .upsert({
          username,
          data: file.data
        })
      error && console.log(error);
      console.log(username);
      // console.log(file);
    }, Promise.resolve());



    alert('Upload successfull!');
    document.getElementById('input').value = '';
    setFiles([])
    setLoading(false);
  }

  const updateSub = async () => {
    setLoading(true);

    const manulaFrom = 'targeting';
    const { data, error } = await supabase
      .from(manulaFrom)
      .select('*')
      .limit(100)
      .eq("imageUrlChanged", false)
    console.log(data);

    error && console.log(error);
    if (error) return;

    var count = 0
    console.log('initial: ', count);

    await data.reduce(async (ref, user) => {
      await ref;
      await new Promise(resolve => setTimeout(resolve, 500));
      user?.account && await updateUserProfilePicUrl(user, manulaFrom)
      count += 1
    }, Promise.resolve());
    // if (count === data.length) return setLoading(false);
    console.log(count);
    setLoading(false);
  }

  // const update = async () => {
  //   setLoading(true);

  //   const manulaFrom = 'users';
  //   const { data, error } = await supabase
  //     .from('users')
  //     .select('profile_pic_url, status, username, user_id')
  //     .neq('status', 'pending')

  //   error && console.log(error);
  //   if (error) return;

  //   var count = 0
  //   console.log('initial: ', count);

  //   await data.reduce(async (ref, user) => {
  //     await ref;
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     user?.username && await updateUserProfilePicUrl(user)
  //     count += 1
  //   }, Promise.resolve());
  //   // if (count === data.length) return setLoading(false);
  //   console.log(count);
  //   setLoading(false);
  // }

  const updateChargebeeCustomerId = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("users").select().eq("subscribed", true).is("chargebee_customer_id", null).limit(1000)
    if (error) {
      console.log(error);
      alert(error?.message)
    }

    console.log(data);
    data.forEach(async (user) => {
      // get chargebee_customer_id
      let getCustomer = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/customer_list`, { email: user?.email })
      if (getCustomer?.data?.id) {
        const update = {
          chargebee_customer_id: getCustomer?.data?.id
        }
        const updateUser = await supabase
          .from("users")
          .update(update).eq('username', user?.username)
        if (updateUser.error) {
          console.log('update error for: ' + user.username);
          setLoading(false)
          return
        } else {
          console.log('update success for: ' + user.username);
          setLoading(false)
          return
        }
      } else {
        console.log('user not found in chargebee: ' + user.username + ' ' + user.email);
        setLoading(false)
        return
      }
    });
  }


  return (<>
    <Nav />
    <div className="h-screen flex flex-col">
      <div className="w-[250px]">
        <h1 className="mb-5">Upload session file (Json)</h1>

        <div className="flex items-center gap-5">
          <input type="file" id="input" onChange={handleChange} multiple accept="application/JSON" />
          {reading && (<Spinner animation="border" />)}
        </div>

        <button className={`${files.length > 0 ? 'bg-secondaryblue' : 'bg-gray-600'} w-full mt-4 rounded-[10px] py-4 text-base text-white font-bold`}
          onClick={handleUploadSessionFile}
        >
          {Loading ? "Loading " : "Upload"}
        </button>
      </div>

      <div className="w-[250px]">
        <button className={`${files.length > 0 ? 'bg-secondaryblue' : 'bg-gray-600'} w-full mt-10 rounded-[10px] p-4 text-base text-white font-bold`}
          onClick={updateChargebeeCustomerId}
        >
          {Loading ? "PROCESSING..." : "Update All user Chargebee Customer Id"}
        </button>
      </div>
    </div>


    <button className={`${!Loading ? 'bg-secondaryblue' : 'bg-gray-600'} hidden w-full mt-10 rounded-[10px] py-4 text-base text-white font-bold`}
      onClick={updateSub}
    >
      {Loading ? "updating " : "update"}
    </button>




  </>);
}
