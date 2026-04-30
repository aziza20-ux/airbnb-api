
export interface Listing{
    id:number,
    title:string,
    description:string,
    location:string,
    pricePerNight:string,
    guests:number,
    type:"apartment" | "house" | "villa" | "cabin",
    amenities:string[],
    host:string
}

export const listings:Listing[]= [{
    id:1,
    title:"guesthouse",
    description:"really comfortable",
    location:'kk509',
    pricePerNight:"200$",
    guests:4,
    type: "cabin",
    amenities:["light","tap","tv"],
    host:"aziza"
},
{
    id:2,
    title:"villa",
    description:"really comfortable",
    location:'kk509',
    pricePerNight:"200$",
    guests:3,
    type: "cabin",
    amenities:["light","tap","tv"],
    host:"aziza"
},
{
    id:3,
    title:"beba apartment",
    description:"really comfortable",
    location:'kk509',
    pricePerNight:"200$",
    guests:4,
    type: "cabin",
    amenities:["light","tap","tv"],
    host:"aziza"
}
]