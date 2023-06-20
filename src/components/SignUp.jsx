import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { getRefCode } from "../helpers";
import { supabase } from "../supabaseClient";
import AlertModal from "./AlertModal";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState({ title: 'Alert', message: 'something went wrong' })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");


  const navigate = useNavigate();


  const handleSignUp = async (e) => {
    e.preventDefault()
    if (loading) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.log(error.message);
      // alert(error.message);
      setIsModalOpen(true);
      setErrorMsg({ title: 'Registration Error', message: error.message })
      setLoading(false);
      return;
    }

    if (data) {
      // console.log(data?.user?.username);
      const { error } = await supabase
        .from("users")
        .insert({
          user_id: data.user.id,
          full_name: fullName,
          email,
          username: data?.user?.username || ''
        });
      if (error) {
        console.log(error);
        setLoading(false);
        alert('something went wrong');
        return
      }
      const ref = getRefCode()
      if (ref) {
        navigate(`/search?ref=${ref}`)
      } else {
        navigate("/search")
      }
    }
    setLoading(false);
  };

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    const user = await supabase.auth.getUser()
    if (!user?.error) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user?.data?.user?.id)
      console.log({ error })

      if (data?.user) {
        window.location = `/dashboard/${data.user?.user_id}`;
        return;
      } else {
        // alert(error.message)
        const { error } = await supabase
          .from("users")
          .insert({
            user_id: user?.data?.user?.id,
            full_name: fullName,
            email: user?.data?.user?.email || '',
            username: ''
          });
        if (error) return alert(error.message)
        navigate("/search")
      }
    } else {
      console.log({ error })
      navigate("/search")
      // alert(error.message)
    }
  }

  // useEffect(() => {
  //   const scriptText = `
  //     (function(t,a,p){t.TapfiliateObject=a;t[a]=t[a]||function(){ (t[a].q=t[a].q||[]).push(arguments)}})(window,'tap');

  //     tap('create', '40122-96e787', { integration: "javascript" });
  //     tap('detect');
  //   `
  //   const script = document.createElement('script');
  //   script.type = "text/javascript"
  //   script.innerHTML = scriptText
  //   document.querySelector('#affiliateScript').appendChild(script)
  // }, [])

  return (<>
    <AlertModal
      isOpen={isModalOpen}
      onClose={() => { setIsModalOpen(false) }}
      title={errorMsg?.title}
      message={errorMsg?.message}
    />
    
    <div id="affiliateScript"></div>

    <div className="flex flex-col justify-center items-center h-screen">
      <div className="p-5 md:p-10 md:shadow-lg rounded-[10px] w-full md:w-[458px]">
        <div className="flex flex-col justify-center items-center">
          {/* <img className="w-48 h-40 mt-10 lg:mt-14" src={sproutyLogo} alt="sprouty social" /> */}
          <div className="font-MADEOKINESANSPERSONALUSE text-[28px]">
            <img src="/sproutysocial-light.svg" alt="" className="w-[220px]" />
            {/* <img src="/LogoSprouty2.svg" alt="" className="w-[220px]" /> */}
            {/* <strong className="text-[25px] text-left">SPROUTYSOCIAL</strong> */}
          </div>
          <hr className="mb-7 w-full border-[#ef5f3c]" />

          <h5 className="font-semibold text-[2rem] text-center text-black font-MontserratSemiBold mt-[30px]">Partner With Us</h5>
          {/* <p className="text-center text-[0.75rem] font-MontserratRegular text-[#333]">Start growing <span className="font-bold">~1-10k</span> real and targeted Instagram <br /><span className="font-bold">followers</span> every month.</p> */}
          <p className="text-center text-[0.8rem] mt-2 mb-6 font-MontserratRegular text-black max-w-[320px]">Join more than <span className="font-bold">25,000</span> users that trust SproutySocial to grow on Instagram. <br className="md:hidden" /> Create an account.</p>
        </div>
        <form action="" className="flex flex-col items-center justify-start" onSubmit={handleSignUp}>
          <div className="form-outline mb-3">
            <input
              type="text"
              id="form2Example1"
              className="rounded-[5px] h-[52px] px-4 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
              value={fullName}
              placeholder="Full Name"
              onChange={({ target }) => setFullName(target.value)}
            />
          </div>
          <div className="form-outline mb-3">
            <input
              type="email"
              id="form2Example1"
              className="rounded-[5px] h-[52px] px-4 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
              value={email}
              placeholder="Email Address"
              onChange={({ target }) => setEmail(target.value)}
            />
          </div>

          <div className="form-outline">
            <input
              type="password"
              id="form2Example2"
              className="rounded-[5px] h-[52px] px-4 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
              value={password}
              placeholder="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>

          <button
            type="submit"
            className="text-white font-MontserratSemiBold text-[16px] mt-6 mb-2 rounded-[5px] h-[52px] px-4 w-72 md:w-80 font-semibold"
            style={{
              backgroundColor: '#ef5f3c',
              color: 'white',
              boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)'
            }}
          >
            {loading ? 'Processing...' : 'Sign Up Now'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-black font-MontserratRegular">
            Already have an account? <Link to="/login"><span className="font-MontserratSemiBold text-[#1b89ff]">Sign in</span></Link>
          </p>
        </div>

        <div className="hidden del-flex justify-center items-center relative my-8">
          <hr className="w-full" />
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-4 bg-white text-black">OR</div>
        </div>

        <div className="hidden del-flex items-center justify-center mt-8 mb-[12px]">
          <button
            onClick={signInWithGoogle}
            type="button"
            className="flex items-center justify-center gap-2 font-MontserratSemiBold text-[16px] rounded-[5px] h-[52px] px-6 w-72 md:w-80 font-semibold bg-white text-black"
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
      </div>
    </div>
  </>
  );
}
