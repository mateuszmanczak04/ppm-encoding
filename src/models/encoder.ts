import type { Alphabet } from '../types';
import Contexts from './contexts';

class Encoder {
	declare contexts: Contexts;
	declare alphabet: Alphabet;
	declare payloads: string[];

	constructor(maxContext: number, alphabet: Alphabet) {
		this.alphabet = alphabet;
		this.contexts = new Contexts(maxContext, alphabet);
	}

	encode(message: string): string[] {
		const payloadsToSend: string[] = this.contexts.processMessage(message);

		return payloadsToSend;
	}

	getNextPayload() {}
}

export default Encoder;
