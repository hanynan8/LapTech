// // app/components/AuthButtons/SignIn.js
// "use client";

// import { signIn } from "next-auth/react";
// import { FcGoogle } from "react-icons/fc";
// import { FaGithub } from "react-icons/fa";

// export default function SignIn() {
//   return (
//     <div className="flex flex-col gap-3">
//       {/* Google Sign In */}
//       <button
//         onClick={() => signIn("google")}
//         className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-100 transition"
//       >
//         <FcGoogle className="text-xl" />
//         <span className="font-medium">Sign in with Google</span>
//       </button>

//       {/* GitHub Sign In */}
//       <button
//         onClick={() => signIn("github")}
//         className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-100 transition"
//       >
//         <FaGithub className="text-xl" />
//         <span className="font-medium">Sign in with GitHub</span>
//       </button>
//     </div>
//   );
// }
