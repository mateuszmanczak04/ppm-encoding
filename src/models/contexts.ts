import type { Alphabet } from '../types';

class Contexts {
	declare contextMinusOne: Record<string, 1>;
	declare contexts: Record<string, Record<string, number>>;
	declare maxContext: number;
	declare alphabet: Alphabet;
	static ESC = '<ESC>';

	constructor(maxContext: number, alphabet: Alphabet) {
		this.maxContext = maxContext;
		this.alphabet = alphabet;
		this.contextMinusOne = {};
		this.contexts = {};

		for (const letter of alphabet) {
			this.contextMinusOne[letter] = 1;
		}
	}

	increaseContext(appearsAfter: string, letter: string) {
		// If context doesn't exist yet
		if (!(appearsAfter in this.contexts)) {
			this.contexts[appearsAfter] = {
				[Contexts.ESC]: 1,
			};
		}

		if (letter in this.contexts[appearsAfter]) {
			this.contexts[appearsAfter][letter] += 1;
		} else {
			this.contexts[appearsAfter][letter] = 1;
		}
	}

	processMessage(message: string) {
		const payloadsToSend: string[] = [];
		for (let i = 0; i < message.length; i++) {
			const letter = message[i];

			// Only go up to the available context length
			const maxAvailableOrder = Math.min(i, this.maxContext);

			for (let order = maxAvailableOrder; order >= 0; order--) {
				const start = i - order;
				const context = message.substring(start, i);

				// Check if letter exists in this context
				if (order === 0) {
					// Context -1: always exists
					payloadsToSend.push(context + letter);
					break;
				} else if (context in this.contexts && letter in this.contexts[context]) {
					// Letter found in this context
					payloadsToSend.push(context + letter);
					break;
				} else if (context in this.contexts) {
					// Context exists but letter not found, send escape
					payloadsToSend.push(context + Contexts.ESC);
				}
			}

			// Update contexts after encoding
			for (let order = maxAvailableOrder; order >= 0; order--) {
				const start = i - order;
				const context = message.substring(start, i);
				this.increaseContext(context, letter);
			}
		}
		return payloadsToSend;
	}
}

export default Contexts;
