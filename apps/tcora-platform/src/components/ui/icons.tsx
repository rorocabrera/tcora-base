import {
    Loader2,
    LucideProps,
  } from "lucide-react"
  
  export const Icons = {
    spinner: (props: LucideProps) => (
      <Loader2 
        {...props} 
        className={`${props.className || ''} animate-spin`}
      />
    ),
    logo: (props: LucideProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
  }