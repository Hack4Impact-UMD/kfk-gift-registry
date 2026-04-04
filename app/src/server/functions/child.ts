import { getServerDB } from "@/lib/firebase.server";
import z from "zod";
import { createServerFn } from "@tanstack/react-start";

const childParamSchema = z.object({ // just so it's clean for the input validator
    driveId: z.string()
})

export const getAllChildProfilesForDrive = createServerFn({
    method: "GET"
})
    .inputValidator(childParamSchema)
    .handler(async ({data}) => {
        
    })
export const getAllApprovedFamilyProfilesForDrive= createServerFn({
    method: "GET"
})
    .inputValidator(childParamSchema)
    .handler(async ({data}) => {
        
    })
export const getApprovedProfileTableRows= createServerFn({
    method: "GET"
})
    .inputValidator(childParamSchema)
    .handler(async ({data}) => {
        
    })
