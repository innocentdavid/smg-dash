import { useEffect, useState } from "react";
// import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../helpers";
import { supabase } from "../supabaseClient";
import AlertModal from "./AlertModal";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa";
import i18next from "i18next";
// import { BsFacebook } from "react-icons/bs";

export default function Login() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState({ title: 'Alert', message: 'something went wrong' })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // check_auth
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const u = user ? await getUser(user?.id) : null
      if (u?.status === 200) return navigate(`/dashboard/${u?.obj.username}`)
      // console.log(u);
    };

    getData();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return;

    setLoading(true);
    const authUserObj = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authUserObj?.error) {
      console.log(authUserObj?.error?.message);
      if (authUserObj?.error?.message === 'Invalid login credentials') {
        showErrorAlert(authUserObj?.error)
        // alert(`${authUserObj.error.message}, please check your credentials and try again`);
        setLoading(false);
        return;
      }
      if (authUserObj.error?.message === `Cannot read properties of null (reading 'id')`) {
        // alert('User not found please try again or register')
        setIsModalOpen(true);
        setErrorMsg({ title: 'Login Error', message: 'User not found please try again or register' })
        return;
      } else {
        // alert('An error occurred, please try again')
        setIsModalOpen(true);
        setErrorMsg({ title: 'Login Error', message: 'An error occurred, please try again' })
        return;
      }
    }

    if (authUserObj?.error) {
      setLoading(false);
      return;
    }

    const contd = await regContd(authUserObj?.data?.user)
    if (contd?.status !== 200) return showErrorAlert(contd)

    setLoading(false);
  }

  function showErrorAlert(error) {
    if (error) {
      // alert("Error occurred while signing in with Google, please try again")
      console.log(error);
      setIsModalOpen(true);
      setErrorMsg({ title: 'Login Error', message: error?.message })
    }
  }

  // async function handleOAuthSignIn(provider) {
  //   if (loading) return;

  //   setLoading(true);
  //   const withOAuthRes = await supabase.auth.signInWithOAuth({ provider })
  //   console.log(withOAuthRes);
  //   if (withOAuthRes.error) return showErrorAlert(withOAuthRes.error)

  //   const authUser = await supabase.auth.getUser()
  //   if (authUser?.error) return showErrorAlert(authUser?.error)

  //   const contd = await regContd(authUser?.data?.user)
  //   contd?.status !== 200 && showErrorAlert(contd)

  //   setLoading(false);
  // }

  const regContd = async (authUser) => {
    const user = await getUser(authUser?.id)
    if (user) {
      if (user.status === 500) {
        console.log(user.obj);
        alert('an error occured')
        setLoading(false);
        return
      } else {
        navigate(`/dashboard/${user?.obj?.username}`)
        // window.location = `/dashboard/${authUser?.data?.user?.username}`;
      }
      setLoading(false);
      return;
    }
  }

  return (<>
    <div className="fixed z-50 text-xs rounded-lg shadow-2xl shadow-white w-fit h-fit top-1 md:top-4 right-4 backdrop-blur-md md:text-base">
      <LangSwitcher />
    </div>

    <AlertModal
      isOpen={isModalOpen}
      onClose={() => { setIsModalOpen(false) }}
      title={errorMsg?.title}
      message={errorMsg?.message}
    />

    <div id="affiliateScript"></div>
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-5 md:p-10 md:shadow-lg rounded-[10px] w-full md:w-[458px]">
        <div className="flex flex-col items-center justify-center">
          {/* <img className="w-48 h-40 mt-10 lg:mt-14" src={sproutyLogo} alt="sprouty social" /> */}
          <div className="font-MADEOKINESANSPERSONALUSE text-[28px]">
            <div className="items-center hidden gap-2 md:flex">
              <img src="/logo.png" alt="" className="w-[38px] h-[34.26px]" />
              <b className="text-[32px]">Propulse</b>
            </div>
          </div>

          <h5 className="font-semibold text-[2rem] text-center text-black-r font-MontserratSemiBold mt-[30px]">{t("Welcome Back")}</h5>
          {/* <p className="text-center text-[0.8rem] mt-2 mb-6 font-MontserratRegular text-black-r max-w-[320px]">{t("Start growing")} <span className="font-bold">{t("~1-10k")}</span> {t("real and targeted Instagram")} <span className="font-bold">{t("followers")}</span> {t("every month")}.</p> */}
          <p className="text-center text-[0.8rem] mt-2 mb-6 font-MontserratRegular text-black-r max-w-[320px]">{t("login_page_desc")}</p>
        </div>
        <form action="" className="flex flex-col items-center justify-start" onSubmit={handleLogin}>
          <div className="mb-3 form-outline font-MontserratRegular">
            <input
              type="email"
              id="form2Example1"
              className="rounded-[5px] h-[52px] px-4 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
              value={email}
              placeholder={t("email_address")}
              onChange={({ target }) => setEmail(target.value)}
            />
          </div>

          <div className="form-outline">
            <input
              type="password"
              id="form2Example2"
              className="rounded-[5px] h-[52px] px-4 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
              value={password}
              placeholder={t("Password")}
              onChange={({ target }) => setPassword(target.value)}
            /> <br />
            <Link to="/forget-password"><span className="text-[#b16cea] font-MontserratSemiBold font-[600] text-[14px] mt-3">{t('Forgot_Password')}</span></Link>
          </div>

          <button
            type="submit"
            className="button-gradient2 text-white font-MontserratSemiBold text-[16px] mt-6 mb-2 rounded-[5px] py-2 px-6 h-[52px] w-72 md:w-80 font-semibold"
            style={{
              boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)'
            }}
          >
            {loading ? `${t('Processing')}...` : `${t('Continue')}`}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-black-r font-MontserratRegular">
            {t('dont-have-an-account')} <Link to="/SignUp"><span className="font-MontserratSemiBold text-[#b16cea] capitalize">{t('Sign_Up')}</span></Link>
          </p>
        </div>

        {/* login with oAuth */}

        {/* <div className="relative items-center justify-center hidden my-8 del-flex">
          <hr className="w-full" />
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-4 bg-[#1C1A26] text-white-r">OR</div>
        </div>

        <div className="flex items-center justify-center mt-8 mb-[12px]">
          <button
            onClick={() => handleOAuthSignIn('google')}
            type="button"
            className="flex items-center justify-center gap-2 font-MontserratSemiBold text-[16px] rounded-[5px] h-[52px] px-6 w-72 md:w-80 font-semibold bg-[#1C1A26] text-white-r"
            style={{
              border: '1px solid #ef5f3c',
              color: 'white',
              boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)'
            }}
          >
            <FcGoogle />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="flex items-center justify-center mt-8 mb-[12px]">
          <button
            onClick={() => handleOAuthSignIn('facebook')}
            type="button"
            className="flex items-center justify-center gap-2 font-MontserratSemiBold text-[16px] rounded-[5px] h-[52px] px-6 w-72 md:w-80 font-semibold bg-[#1C1A26] text-white-r"
            style={{
              border: '1px solid #ef5f3c',
              color: 'white',
              boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)'
            }}
          >
            <BsFacebook />
            <span>Continue with Facebook</span>
          </button>
        </div> */}

        <br /><br />
      </div>
    </div>
  </>
  );
}

export const LangSwitcher = () => {
  const languages = [
    { value: 'fr', text: "French", flag: '/french_flag.png' },
    { value: 'en', text: "English", flag: '/british_flag.svg' },
  ]

  const [lng, setLang] = useState('fr');
  const [showLangOptions, setShowLangOptions] = useState(false)

  useEffect(() => {
    var urlParams = new URLSearchParams(window.location.search);
    var lng = urlParams.get('lng');
    if (lng) {
      const selectedLang = languages.find(l => l.value === lng)
      setLang(selectedLang?.value)
    }else{
      const lng = localStorage.getItem('lng') || 'fr';
      const el = document.getElementsByTagName('html')[0]
      el.lang = lng
      setLang(lng)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = lng => {
    setLang(lng);
    i18next.changeLanguage(lng)
    localStorage.setItem('lng', lng);
    const el = document.getElementsByTagName('html')[0]
    el.lang = lng
    // window.location = `?lng=${lng}`;
    // window.location.reload();
    setShowLangOptions(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1 p-3 uppercase" onClick={() => setShowLangOptions(!showLangOptions)}>
        {lng} <FaAngleDown />
      </div>

      {showLangOptions && <div className="absolute top-0 flex flex-col right-full bg-[#242424]">
        <button className="p-3 border-b border-gray20 hover:bg-[#242424]" onClick={() => handleChange('en')}>EN</button>
        <button className="p-3 hover:bg-[#242424]" onClick={() => handleChange('fr')}>FR</button>
      </div>}
    </div>
  )
}