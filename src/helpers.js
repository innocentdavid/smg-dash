// import Axios from 'axios'
import axios from "axios"
import _ from 'lodash';
// import { slackClient } from "./slackClient";
import { supabase } from "./supabaseClient"
const craperAPI = "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile"

export const numFormatter = (num = 0) => {
  if (num > 999 && num <= 999949) {
    return `${(num / 1000).toFixed(1)}k`
  }

  if (num > 999949) {
    return `${(num / 1000000).toFixed(1)}m`
  }

  if (num === 0) return 0

  if (num) {
    return num
  }
}

export const dateFormatter = (timeFrame) => {
  const getPrevDay = () => {
    // if the day is 0 that means need to the get the last day of the the previous month

    let prevMonth // will be obj

    if (!months[today.getMonth() - 1].month) {
      prevMonth = months[months.length - 1]
      previousMonth = prevMonth.month
    } else {
      prevMonth = months[today.getMonth() - 1].month
    }
    return prevMonth
  }

  const months = [
    { month: "Jan", days: 31 },
    { month: "Feb", days: 28 },
    { month: "Mar", days: 31 },
    { month: "Apr", days: 30 },
    { month: "May", days: 31 },
    { month: "Jun", days: 30 },
    { month: "Jul", days: 31 },
    { month: "Aug", days: 31 },
    { month: "Sep", days: 30 },
    { month: "Oct", days: 31 },
    { month: "Nov", days: 30 },
    { month: "Dec", days: 31 },
  ]

  const today = new Date()
  console.log("🚀 ~ file: helpers.js:42 ~ dateFormatter ~ today", today)

  let previousMonth
  let currentDate
  let previousDate

  if (timeFrame === "Monthly") {
    // ex. Month ---  Mar
    currentDate = `${months[today.getMonth()].month}`
    previousDate = `${months[today.getMonth() - 1].month
      ? months[today.getMonth() - 1].month
      : "Dec"
      }`
  } else if (timeFrame === "Daily") {
    // ex. Day and Month ---  25 Mar
    currentDate = `${today.getDate()} ${months[today.getMonth()].month}`
    previousDate = `${today.getDate() - 1 ? today.getDate() - 1 : getPrevDay().days
      } ${previousMonth ? previousMonth : months[today.getMonth()].month}`
  }

  return [previousDate, currentDate]
}

export const getRateDiff = (currRate, prevRate) => {
  //get percentage value
  let percent = (currRate / prevRate) * 100

  // if 'percent' is more than a 100, it means there was an increase from the previous value
  if (percent > 100) {
    // subtract from 100 to get the value of by HOW MUCH the current value increased
    return {
      change: "more",
      value: percent - 100,
    }
  }

  // if 'percent' is less than a 100, it means there was an DECREASE from the previous value
  if (percent < 100) {
    // get the value of by HOW MUCH it decreased compared to the before value
    return {
      change: "less",
      value: 100 - percent,
    }
  }

  // if 'percent' is equal to 100, there was no change from previous value
  if (percent === 100) {
    return null
  }
}

export const countDays = (day) => {
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, "0")
  var mm = String(today.getMonth() + 1).padStart(2, "0") //January is 0!
  var yyyy = today.getFullYear()

  today = yyyy + "-" + mm + "-" + dd

  if (today === day) return "today"

  var date1 = new Date(day)
  var date2 = new Date(today)
  var Difference_In_Time = date2.getTime() - date1.getTime()
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

  return Difference_In_Days === 1
    ? "one day ago"
    : Difference_In_Days + " days ago"
}

export const getAccount = async (account) => {
  const options = {
    method: "GET",
    url: craperAPI,
    params: { ig: account, response_type: "short", corsEnabled: "true" },
    headers: {
      "X-RapidAPI-Key": "47e2a82623msh562f6553fe3aae6p10b5f4jsn431fcca8b82e",
      "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
    },
  }

  const userResults = await axios.request(options)

  return userResults
}

export const searchAccount = _.memoize(async (username) => {
  const options = {
    method: "GET",
    url: craperAPI,
    // params: { ig: username, response_type: "search", corsEnabled: "true", storageEnabled: "true" },
    params: { ig: username, response_type: "search", corsEnabled: "true" },
    headers: {
      "X-RapidAPI-Key": "47e2a82623msh562f6553fe3aae6p10b5f4jsn431fcca8b82e",
      "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
    },
  }

  const request = await axios.request(options).catch(err => console.log(err))
  return request?.data?.[0]
})

export const updateUserProfilePicUrl = async (user, from) => {
  const username = from ? user.account : user.username;
  // console.log(username, from);
  if (username) {
    const userResults = await instabulkProfileAPI(username)
    // console.log(userResults?.data[0]?.username);
    if (!userResults?.data[0]?.username) return console.log('User account not found!: ', username, ' =>: ', userResults?.data[0]?.username);

    if (userResults?.data?.[0]?.profile_pic_url) {

      if (from) {
        console.log(username);
        const { error } = await supabase
          .from(from)
          .update({
            avatar: userResults.data[0].profile_pic_url,
            imageUrlChanged: true
          })
          .eq('id', user?.id);

        error && console.log(error)
      } else {
        const { error } = await supabase
          .from("users")
          .update({
            profile_pic_url: userResults.data[0].profile_pic_url,
          }).eq('user_id', user?.user_id);

        error && console.log(error)
        return { success: true, ppu: userResults.data[0].profile_pic_url }
      }

      console.log('fixed for: ', username)
      return { succuss: true, message: 'ok' }
    }
  } else {
    return { succuss: false, message: 'username invalid' }
  }
}

export async function instabulkProfileAPI(ig) {
  const params = { ig, response_type: "short", storageEnabled: "true" };
  // const params = { ig: user?.account, response_type: "short", corsEnabled: "false" };
  const options = {
    method: "GET",
    url: "https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile",
    params,
    headers: {
      "X-RapidAPI-Key": "47e2a82623msh562f6553fe3aae6p10b5f4jsn431fcca8b82e",
      "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
    },
  };
  return await axios.request(options);
}

export const totalLikes = (name) => {
  const options = {
    method: "GET",
    url: craperAPI,
    params: { ig: name, response_type: "feeds" },
    headers: {
      "X-RapidAPI-Key": "47e2a82623msh562f6553fe3aae6p10b5f4jsn431fcca8b82e",
      "X-RapidAPI-Host": "instagram-bulk-profile-scrapper.p.rapidapi.com",
    },
  }

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data)
    })
    .catch(function (error) {
      console.error(error)
    })
}

export const getThDayNameFromDate = (date) => {
  const day = new Date(date).toDateString().slice(0, 3)
  return day
}

export const deleteAccount = async (from, id) => {
  // console.log(from, id);
  if (id && window.confirm("Are you sure you want to delete this account?")) {
    const { data, error } = await supabase
      .from(from)
      .delete()
      .match({ id: id })
    // .eq('id', id).select();
    console.log(data, error)
    // alert('error deleting account! contact admin');
    return data
  }
}

export const deleteUserDetails = async (user_id) => {
  // console.log(user_id);
  await deleteUser(user_id);
  await deleteUserBlacklist(user_id);
  await deleteUserTargeting(user_id);
  await deleteUserWhitelist(user_id);
  return 'success'
}

export const deleteUser = async (user_id) => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq('user_id', user_id)
  console.log(error)
  // return data
}

export const deleteUserBlacklist = async (user_id) => {
  const { error } = await supabase
    .from("blacklist")
    .delete()
    .eq('user_id', user_id)
  console.log(error)
  // return data
}

export const deleteUserTargeting = async (user_id) => {
  const { error } = await supabase
    .from("targeting")
    .delete()
    .eq('user_id', user_id)
  console.log(error)
  // return data
}

export const deleteUserWhitelist = async (user_id) => {
  const { error } = await supabase
    .from("whitelist")
    .delete()
    .eq('user_id', user_id)
  console.log(error)
  // return data
}

export const getUser = async (uid) => {
  var error;
  if (uid) {
    const userObj = await supabase
      .from('users')
      .select('*')
      .eq('user_id', uid)
    error = userObj.error
    const r = { status: 200, obj: userObj?.data?.[0] }
    // console.log(r);
    return r;
  }
  return { status: 500, obj: error };
}

export const messageSlack = async (message) => {
  const baseUrl = process.env.REACT_APP_BASE_URL
  // const baseUrl = 'http://localhost:8000'

  // console.log({ message });
  
  const r = await axios.post(baseUrl + '/api/notify', {
    webhookUrl: 'https://hooks.slack.com/services/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',
    message
  }).then(r => {
    // console.log(r);
    return r
  })
    .catch((e) => {
      console.log(e);
    })
  return r
}

// Function to fetch and upload image in subscriptions.js 183
export async function uploadImageFromURL(username, imageURL) {
  // Fetch image data from URL
  const response = await fetch(imageURL);
  const imageData = await response.blob();

  // Upload image to Supabase storage
  const { data, error } = await supabase.storage
  .from('profilePictures')
  .upload(`${username}.jpg`, imageData, {
    upsert: true
  });

  // if (error.message === 'The resource already exists') {
  //   return { status: 'success', data: {path: `${username}.jpg`}}
  // }
  if (error) {
    console.log(error);
    return {status: 'failed', data: error}
  } else {
    // console.log(`Image uploaded to ${data}`);
    const publicUrl = getDownloadedFilePublicUrl(data.path)
    return { status: 'success', data: publicUrl?.data?.publicUrl }
  }
}

export function getDownloadedFilePublicUrl(path){
  const publicUrl = supabase.storage
    .from('profilePictures')
    .getPublicUrl(path)
  return publicUrl
}