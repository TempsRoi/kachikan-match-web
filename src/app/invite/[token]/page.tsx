import {Invite} from "@/components/Game"; export default async function Page({params}:{params:Promise<{token:string}>}){return <Invite token={(await params).token}/>}
