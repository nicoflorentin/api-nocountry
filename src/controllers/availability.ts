import { Request, Response } from "express"
import { makeAvailabilityService } from "../services/availability"

let availabilityService: Awaited<ReturnType<typeof makeAvailabilityService>>
;(async () => {
	availabilityService = await makeAvailabilityService()
})()

export const getAllAvailabilities = async (req: Request, res: Response) => {
	try {
		if (!availabilityService) {
			throw new Error("Availavility service not initialized")
		}
		console.log("create availability service")
		const availabilities = await availabilityService.getAllAvailabilities()
		return res.status(200).json({ msg: "test ok jej", data: availabilities })
	} catch (error) {
		console.error("Error testing availabilities:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const testAvailability = (req: Request, res: Response) => {
	try {
		console.log("create availability service")
		return res.status(200).json({ msg: "get all ok" })
	} catch (error) {
		console.error("Error getting all availabilities:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const getAvailabilitiesByDoctorID = async (req: Request, res: Response) => {
	try {
		if (!availabilityService) {
			throw new Error("Availability service not initialized")
		}

		const { id } = req.params
		const availabilities = await availabilityService.getAvailabilitiesByDoctorID(id)

		return res.status(200).json({ availabilities })
	} catch (error) {
		console.error("Error fetching availabilities:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}
