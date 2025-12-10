import { useRef, useState } from 'react';
import { ESC } from '../consts';
import type { Alphabet, Context } from '../types';

type Props = {
	maxContext: number;
	alphabet: Alphabet;
	pushToQueue: (message: string) => void;
};

const Sender = ({ alphabet, pushToQueue }: Props) => {
	const [contextsToRender, setContextsToRender] = useState<Context[]>(() => {
		// Initialize context -1 at the start
		const contextMinusOne: Context = {
			order: -1,
			appearsAfter: '',
			symbols: alphabet.sort().map((letter) => ({ symbol: letter, count: 1 })),
		};
		const contextZero: Context = {
			order: 0,
			appearsAfter: '',
			symbols: [{ symbol: ESC, count: 1 }],
		};
		return [contextZero, contextMinusOne];
	});

	const [message] = useState<string>('moto-toto-tototo');
	const [currentSymbolIndex, setCurrentSymbolIndex] = useState<number>(0);

	// These should be source of truth
	const contexts = useRef<Context[]>(contextsToRender);
	const currentContext = useRef<Context>(contextsToRender[0]);

	const next = () => {
		const messageSoFar = message.slice(0, currentSymbolIndex);
		const currentSymbol = message[currentSymbolIndex];

		if (isSymbolInContext(currentContext.current, currentSymbol)) {
			// Send symbol to receiver
			pushToQueue(currentSymbol);
			setCurrentSymbolIndex((prev) => prev + 1);

			// Update context 0
			increateSymbolCountInContextZero(currentSymbol);

			// Update context 1 (without current symbol)
			let order = 1;
			let appearsAfter = messageSoFar.slice(-order);
			let context = getContext(1, appearsAfter);
			if (context) {
				increaseContextSymbolCount(context, currentSymbol);
			}

			// Maybe create context 1 (with current symbol)
			order = 1;
			appearsAfter = currentSymbol;
			context = getContext(order, appearsAfter);
			if (!context) {
				createContext(order, currentSymbol);
			}

			if (messageSoFar.length >= 2) {
				// Update context 2
				order = 2;
				appearsAfter = messageSoFar.slice(-order);
				context = getContext(order, appearsAfter);
				if (context) {
					increaseContextSymbolCount(context, currentSymbol);
				}
			}

			if (messageSoFar.length >= 1) {
				// Maybe create context 2 (with current symbol)
				order = 2;
				appearsAfter = messageSoFar.slice(-1) + currentSymbol;
				context = getContext(order, appearsAfter);
				if (!context) {
					createContext(order, appearsAfter);
				}
			}

			refreshCurrentContext();
		} else {
			// Sending <ESC> denotes moving to lower context
			pushToQueue(ESC);

			const newCurrentContext = getContext(
				currentContext.current.order - 1,
				currentContext.current.appearsAfter.slice(1),
			);
			if (newCurrentContext) {
				currentContext.current = newCurrentContext;
			}
		}
	};

	const increaseContextSymbolCount = (context: Context, symbol: string) => {
		const newContexts: Context[] = contexts.current.map((ctx) => {
			if (ctx.order === context.order && ctx.appearsAfter === context.appearsAfter) {
				if (isSymbolInContext(context, symbol)) {
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
						symbols: [...ctx.symbols, { symbol, count: 1 }].sort((a, b) =>
							a.symbol.localeCompare(b.symbol),
						),
					};
				}
			}
			return ctx;
		});

		setContextsToRender(newContexts);
		contexts.current = newContexts;
	};

	const getContext = (order: number, appearsAfter: string): Context | undefined => {
		return contexts.current.find(
			(ctx) => ctx.order === order && ctx.appearsAfter === appearsAfter,
		);
	};

	const createContext = (order: number, appearsAfter: string): Context => {
		const newContext: Context = {
			order,
			appearsAfter,
			symbols: [{ symbol: ESC, count: 1 }],
		};

		const newContexts: Context[] = [...contexts.current, newContext].sort((a, b) => {
			if (a.order !== b.order) return b.order - a.order;
			return a.appearsAfter.localeCompare(b.appearsAfter);
		});

		setContextsToRender(newContexts);
		contexts.current = newContexts;

		return newContext;
	};

	const isSymbolInContext = (context: Context, symbol: string): boolean => {
		return !!context.symbols.find((s) => s.symbol === symbol);
	};

	const increateSymbolCountInContextZero = (symbol: string) => {
		// Context zero is created initially so we are certain it's not undefined
		const contextZero = getContext(0, '') as Context;
		increaseContextSymbolCount(contextZero, symbol);
	};

	const getContextZero = (): Context => {
		const contextZero = getContext(0, '') as Context;
		return contextZero;
	};

	const refreshCurrentContext = () => {
		let order = 2;
		let newContextAppearsAfter = message.slice(currentSymbolIndex - 1, currentSymbolIndex + 1);
		let context = getContext(order, newContextAppearsAfter);
		if (context) {
			currentContext.current = context;
		} else {
			order = 1;
			newContextAppearsAfter = message.slice(currentSymbolIndex, currentSymbolIndex + 1);
			context = getContext(order, newContextAppearsAfter);
			if (context) {
				currentContext.current = context;
			} else {
				currentContext.current = getContextZero();
			}
		}
	};

	return (
		<div className='p-4'>
			<h3 className='mb-2 text-xl font-bold'>Sender</h3>
			<button
				className='mb-4 cursor-pointer rounded-md border border-neutral-300 bg-blue-500 px-3 py-1 text-white select-none disabled:cursor-not-allowed disabled:opacity-50'
				onClick={next}
				disabled={currentSymbolIndex === message.length}
			>
				{currentSymbolIndex === message.length
					? 'No more symbols to encode from the message'
					: 'Next'}
			</button>
			<p className='mb-2'>
				Message to encode:{' '}
				<strong className='text-neutral-400'>
					{message.slice(0, currentSymbolIndex)}
					<span className='text-black'>{message[currentSymbolIndex]}</span>
					{message.slice(currentSymbolIndex + 1)}
				</strong>
			</p>

			<section className='mb-8'>
				{contextsToRender.map((ctx) => (
					<div className='mb-4' key={`${ctx.order}:${ctx.appearsAfter}`}>
						<p>
							<strong>Context {ctx.order} </strong>
							{ctx.appearsAfter && <span>after &quot;{ctx.appearsAfter}&quot;</span>}
						</p>
						<table className='w-full table-fixed border-collapse border border-neutral-300 bg-white text-center'>
							<thead className='border-b border-neutral-300'>
								<tr>
									{ctx.symbols.map((symbol) => (
										<th
											key={symbol.symbol}
											// colSpan={symbol.count}
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
											// colSpan={symbol.count}
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
