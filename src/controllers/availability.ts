import { Request, Response } from "express"
import { makeAvailabilityService } from "../services/availability"
import { AvailabilityUpdateSchema } from "../validations/availability"

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

export const updateAvailability = async (req: Request, res: Response) => {
	try {
		if (!availabilityService) {
			throw new Error("Availability service not initialized")
		}

		const { id, day } = req.params
		const result = AvailabilityUpdateSchema.safeParse(req.body)

		if (!result.success) {
			return res.status(400).json({
				errors: result.error.issues.map((e) => ({
					field: e.path.join("."),
					message: e.message,
				})),
			})
		}

		await availabilityService.updateAvailabilityByDoctorID(Number(id), day, result.data)

		return res.status(200).json({ success: true })
	} catch (error) {
		console.error("Error updating availability:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}
