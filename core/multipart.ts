
export class MultipartData {

	private boundary: string;
	private parts: string[] = [];

	constructor(boundary: string) {
		this.boundary = boundary;
	}

	addJSON(name: string, value: any) {
		this.parts.push(
			`--${this.boundary}`,
			`Content-Disposition: form-data; name="${name}"`,
			"Content-Type: application/json",
			"", JSON.stringify(value)
		);
	}

	addField(name: string, value: string) {
		this.parts.push(
			`--${this.boundary}`,
			`Content-Disposition: form-data; name="${name}"`,
			"", value
		);
	}

	addFile(name: string, filename: string, content: string | Uint8Array, contentType = "application/octet-stream") {
		/*this.parts.push(
			`--${this.boundary}`,
			`Content-Disposition: form-data; name="${name}"; filename="${filename}"`,
			`Content-Type: ${contentType}`,
			"", typeof content === "string" ? content : new TextDecoder().decode(content)
		);*/
	}

	build(status: number = 200): Response {
		this.parts.push(`--${this.boundary}--`);
		const body = this.parts.join("\r\n");
		return new Response(body, {
			status, headers: {
				"Content-Type": `multipart/form-data; boundary=${this.boundary}`,
				"Content-Length": String(body.length)
			}
		});
	}

}
