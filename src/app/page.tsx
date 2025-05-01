import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }
  
  return <HomeClient />;
}