import { useState } from 'react';
import type { Alphabet, Context } from '../types';
import { ESC } from '../consts';

type Props = {
	maxContext: number;
	alphabet: Alphabet;
	pushToQueue: (message: string) => void;
};

const Sender = ({ maxContext, alphabet, pushToQueue }: Props) => {
	const [message] = useState<string>('moto-toto-tototo');
	const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
	const [contexts, setContexts] = useState<Context[]>(() => {
		// Initialize context -1 at the start
		const contextMinusOne: Context = {
			order: -1,
			appearsAfter: '',
			symbols: alphabet.sort().map((letter) => ({ symbol: letter, count: 1 })),
		};
		return [contextMinusOne];
	});
	// const [currentContext, setCurrentContext] = useState<Context>(contexts[0]);

	const increaseContextSymbolCount = (
		contextOrder: number,
		contextAppearsAfter: string,
		symbol: string,
	) => {
		const contextExists: boolean = !!contexts.find(
			(ctx) => ctx.order === contextOrder && ctx.appearsAfter === contextAppearsAfter,
		);

		if (contextExists) {
			setContexts((prev) =>
				prev.map((ctx) => {
					if (ctx.order === contextOrder && ctx.appearsAfter === contextAppearsAfter) {
						const symbolExists: boolean = !!ctx.symbols.find(
							(s) => s.symbol === symbol,
						);

						if (symbolExists) {
							return {
								...ctx,
								symbols: ctx.symbols.map((s) => {
									if (s.symbol === symbol) {
										return { ...s, count: s.count + 1 };
									}
									return s;
								}),
							};
						} else {
							return {
								...ctx,
								symbols: [...ctx.symbols, { symbol, count: 1 }],
							};
						}
					}
					return ctx;
				}),
			);
		} else {
			const newContext: Context = {
				appearsAfter: contextAppearsAfter,
				order: contextOrder,
				symbols: [{ symbol: ESC, count: 1 }],
			};
			console.log(newContext);
			setContexts((prev) =>
				[...prev, newContext].sort((a, b) => {
					if (a.order !== b.order) return b.order - a.order;
					return a.appearsAfter.localeCompare(b.appearsAfter);
				}),
			);
		}
	};

	const getContext = (order: number, appearsAfter: string): Context | undefined => {
		return contexts.find((ctx) => ctx.order === order && ctx.appearsAfter === appearsAfter);
	};

	const isSymbolInContext = (context: Context, symbol: string): boolean => {
		return !!context.symbols.find((s) => s.symbol === symbol);
	};

	/**
	 * Calculates next payloads that should be sent to the
	 * receiver and pushes them to the queue.
	 */
	const encodeNextLetter = () => {
		const messageSoFar = message.slice(0, currentLetterIndex);
		const currentSymbol = message[currentLetterIndex];

		// Encode and send
		for (let contextOrder = maxContext; contextOrder >= -1; contextOrder--) {
			const start = currentLetterIndex - contextOrder;
			const contextAppearsAfter = messageSoFar.substring(start);
			const currentContext = getContext(contextOrder, contextAppearsAfter);

			if (currentContext && isSymbolInContext(currentContext, currentSymbol)) {
				pushToQueue(currentSymbol);
				break;
			} else {
				pushToQueue(ESC);
			}
		}

		// Update contexts
		for (
			let contextOrder = Math.min(currentLetterIndex, maxContext);
			contextOrder >= 0;
			contextOrder--
		) {
			const start = currentLetterIndex - contextOrder;
			const contextAppearsAfter = messageSoFar.substring(start);
			increaseContextSymbolCount(contextOrder, contextAppearsAfter, currentSymbol);
		}

		setCurrentLetterIndex((prev) => prev + 1);
	};

	return (
		<div className='p-4'>
			<button
				className='mb-4 cursor-pointer rounded-md border border-neutral-300 bg-blue-500 px-3 py-1 text-white select-none disabled:cursor-not-allowed disabled:opacity-50'
				onClick={encodeNextLetter}
				disabled={currentLetterIndex === message.length}
			>
				{currentLetterIndex === message.length
					? 'No more symbols to encode from the message'
					: 'Encode next symbol'}
			</button>
			<h3 className='mb-2 text-xl font-bold'>Sender</h3>
			<p className='mb-2'>
				Message to encode:{' '}
				<strong className='text-neutral-400'>
					{message.slice(0, currentLetterIndex)}
					<span className='text-black'>{message[currentLetterIndex]}</span>
					{message.slice(currentLetterIndex + 1)}
				</strong>
			</p>

			<section className='mb-8'>
				{contexts.map((ctx) => (
					<div className='mb-4' key={`${ctx.order}:${ctx.appearsAfter}`}>
						<p>
							{/* {ctx.order === currentContext.order &&
								ctx.appearsAfter === currentContext.appearsAfter && (
									<span className='text-neutral-500'>(X)</span>
								)} */}
							<strong>Context {ctx.order} </strong>
							{ctx.appearsAfter && <span>after &quot;{ctx.appearsAfter}&quot;</span>}
						</p>
						<table
							className='w-full table-fixed border-collapse border border-neutral-300 bg-white text-center'
							style={{
								maxWidth: ctx.symbols.reduce((curr, s) => curr + s.count, 0) * 64,
							}}
						>
							<thead className='border-b border-neutral-300'>
								<tr>
									{ctx.symbols.map((symbol) => (
										<th
											key={symbol.symbol}
											colSpan={symbol.count}
											className='border border-neutral-300'
										>
											{symbol.symbol}
										</th>
									))}
								</tr>
							</thead>

							<tbody>
								<tr>
									{ctx.symbols.map((symbol) => (
										<td
											key={symbol.symbol}
											colSpan={symbol.count}
											className='border border-neutral-300'
										>
											{symbol.count}
										</td>
									))}
								</tr>
							</tbody>
						</table>
					</div>
				))}
			</section>
		</div>
	);
};
export default Sender;
