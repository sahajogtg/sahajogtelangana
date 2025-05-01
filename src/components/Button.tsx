'use client'

import { redirect, useRouter } from 'next/navigation';
import Image from "next/image";

type ButtonProps = {
  type: 'button' | 'submit';
  title: string;
  icon?: string;
  variant: string;
  full?: boolean;
}

const Button = ({ type, title, icon, variant, full }: ButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (title === "📌 Centers Near Me") {
      router.push('/centers');
    }

    else if(title === "Know More"){
      router.push('/shri-mataji')
    }
    else if(title === "Read More"){
      router.push('/sahaja-yoga')
    }
    else if(title === "Meditate Now!"){
      router.push('/sahaja-yoga')
    }
    else if(title === "Read More 🍏"){
      window.location.href = "https://sahajakrishi.in/";
    }
  }

  return (
    <button
      className={`flexCenter gap-3 rounded-full border ${variant} ${full && 'w-full'}`}
      type={type}
      onClick={handleClick}
    >
      {icon && <Image src={icon} alt={title} width={24} height={24} />}
      <label className="bold-16 whitespace-nowrap cursor-pointer">{title}</label>
    </button>
  )
}

export default Button;
