import app from "./app"

const port = 3001

export async function main() {
	try {
		// await sequelize.sync(
		//   {
		//     force: false,
		//     // force: true,
		//     // alter: true,
		//   })

		// console.log("DB Connection success!")

		app.listen(port)
		console.log(`Server listening on port ${port}`)
	} catch (err) {
		console.log("Unable to connect to the database", err)
	}
}

main()
