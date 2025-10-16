import { makeMedicService } from "../services/medic"
import { Request, Response } from "express"

let medicService: Awaited<ReturnType<typeof makeMedicService>>
;(async () => {
	medicService = await makeMedicService()
})()

export const getAllMedics = () => {
	return async (req: Request, res: Response) => {
		try {
			if (!medicService) {
				throw new Error("Medic service not initialized")
			}
			const medics = await medicService.getAllMedics()

			return res.status(200).json({ medics })
		} catch (error) {
			console.error("Error fetching medics:", error)
			return res.status(500).json({ error: "Internal server error" })
		}
	}
}

export const getMedicByID = async (req: Request, res: Response) => {
	try {
		if (!medicService) {
			throw new Error('Medic service not initialized')
		}

		const { id } = req.params
		const medic = await medicService.getMedicByID(id)

		return res.status(200).json({ medic })
	} catch (error) {
		if (error instanceof Error && error.message === 'Medic not found') {
			return res.status(404).json({ error: 'Medic not found' })
		}
		console.error('Error fetching medic:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
}
