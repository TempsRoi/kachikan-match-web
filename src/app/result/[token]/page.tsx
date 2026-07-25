import {Result} from "@/components/Game"; export default async function Page({params}:{params:Promise<{token:string}>}){return <Result token={(await params).token}/>}
