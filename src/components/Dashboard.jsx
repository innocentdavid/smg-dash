import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDownloadedFilePublicUrl, uploadImageFromURL } from "../helpers";
import { supabase } from "../supabaseClient";
import Blacklist from "./Blacklist";
import ChartSection from "./ChartSection";
import CrispChat from "./CrispChat";
import Nav from "./Nav";
import StatsCard from "./StatsCard";
import StatsSection from "./StatsSection";
import Targeting from "./Targeting";
import Whitelist from "./Whitelist";

const Error = ({ value }) => {
  return (
    <aside style={{ color: "red" }} className="px-3 py-4 px-sm-5">
      The account @{value} was not found on Instagram.
    </aside>
  );
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [FilterModal, setFilterModal] = useState(false);
  const [user, setUser] = useState(null)
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('start_time');

  let { id } = useParams();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate("/login")
      setUser(user)
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('user_id', user.id)

      console.log(data);
      if (user && !data[0]?.subscribed) {
        // const { data: delUser, error: delUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        // console.log(delUser);
        // if (delUserError) alert(delUserError.message)
        // if (delUser) {
        //   await deleteUserDetails(user.id)
        // }
        // alert('Your registration was not complete. Please re-register your account')
        // await supabase.auth.signOut();
        // window.location.pathname = "/login";
        window.location.pathname = `subscriptions/${data[0].username}`;
      }
      setData(data[0])
      setError(error)
    };

    getData();
  }, [id, navigate]);

  const [sessionsData, setSessionsData] = useState([])

  // console.log(userDefaultdata?.username);
  // sessions
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }


  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  useEffect(() => {
    const fetch = async () => {
      const resData = await supabase
        .from('sessions')
        .select()
        .eq('username', data?.username)
      resData.error && console.log(resData.error);
      const d = JSON.parse(resData.data[0].data)
      // console.log(d[15].profile.followers);
      setSessionsData(d)
    }
    const username = data?.username;
    if (username) {
      fetch()
    }
  }, [data, order, orderBy])

  const setFilterModalCallback = useCallback(() => {
    setFilterModal(false);
  }, [setFilterModal]);

  if (error) return <Error value={id} />;

  console.log("data?.profile_pic_url", data?.profile_pic_url);

  return (<>
    <Nav />
    <div className="container mx-auto px-6">
      <StatsSection
        user={user}
        userData={data}
        user_id={data?.id}
        userId={data?.user_id}
        username={data?.username}
        avatar={data?.profile_pic_url}
        isVerified={data?.is_verified}
        name={data?.full_name}
        bio={data?.biography}
        url={`https://www.instagram.com/${data?.username}`}
        currMediaCount={data?.posts}
        currFollowers={data?.followers}
        currFollowing={data?.following}
        setFilterModal2={setFilterModalCallback}
        filterModal2={FilterModal}
      />
      <StatsCard userData={data} sessionsData={sessionsData} />
      <ChartSection
        sessionsData={sessionsData}
        isPrivate={false}
      />
      {data?.user_id && <>
        <Targeting userId={data?.user_id} />
        <Blacklist userId={data?.user_id} />
        <Whitelist userId={data?.user_id} />
      </>}

    </div>
  </>);
}
