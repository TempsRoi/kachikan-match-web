import {PlayGame} from "@/components/Game"; export default async function Page({params}:{params:Promise<{token:string}>}){return <PlayGame token={(await params).token}/>}
