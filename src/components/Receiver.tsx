import { useRef, useState } from 'react';
import { ESC } from '../consts';
import type { Alphabet, Context } from '../types';
import { cn } from '../utils/cn';

type Props = {
	maxContext: number;
	alphabet: Alphabet;
	popFromQueue: () => string | undefined;
	isSomethingYet: boolean;
};

const Receiver = ({ alphabet, popFromQueue, isSomethingYet }: Props) => {
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
	const [currentContextToRender, setCurrentContextToRender] = useState<Context>(
		contextsToRender[0],
	);

	const [messageToRender, setMessageToRender] = useState<string>('');

	// These should be source of truth
	const message = useRef<string>(messageToRender);
	const contexts = useRef<Context[]>(contextsToRender);
	const currentContext = useRef<Context>(contextsToRender[0]);

	const next = () => {
		const incomingSymbol = popFromQueue();

		if (!incomingSymbol) return;

		if (incomingSymbol == ESC) {
			const newCurrentContext = getContext(
				currentContext.current.order - 1,
				currentContext.current.appearsAfter.slice(1),
			);
			if (newCurrentContext) {
				currentContext.current = newCurrentContext;
				setCurrentContextToRender(newCurrentContext);
			}
		} else {
			// Add symbol to the decoded message
			message.current += incomingSymbol;
			setMessageToRender(message.current);

			// Update context 0
			increateSymbolCountInContextZero(incomingSymbol);

			// Update context 1 (without incoming symbol)
			let order = 1;
			let appearsAfter = message.current.slice(-order - 1, -1);
			let context = getContext(1, appearsAfter);
			if (context) {
				increaseContextSymbolCount(context, incomingSymbol);
			}

			// Create context 1 (with incoming symbol) if doesn't exist yet
			order = 1;
			appearsAfter = incomingSymbol;
			context = getContext(order, appearsAfter);
			if (!context) {
				createContext(order, incomingSymbol);
			}

			if (message.current.length >= 3) {
				// Update context 2
				order = 2;
				appearsAfter = message.current.slice(-order - 1, -1);
				context = getContext(order, appearsAfter);
				if (context) {
					increaseContextSymbolCount(context, incomingSymbol);
				}
			}

			if (message.current.length >= 2) {
				// Create context 2 (with current symbol) if doesn't exist yet
				order = 2;
				appearsAfter = message.current.slice(-order);
				context = getContext(order, appearsAfter);
				if (!context) {
					createContext(order, appearsAfter);
				}
			}

			refreshCurrentContext();
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
		let newContextAppearsAfter = message.current.slice(-order);
		let context = getContext(order, newContextAppearsAfter);
		if (context) {
			currentContext.current = context;
			setCurrentContextToRender(context);
		} else {
			order = 1;
			newContextAppearsAfter = message.current.slice(-order);
			context = getContext(order, newContextAppearsAfter);
			if (context) {
				currentContext.current = context;
				setCurrentContextToRender(context);
			} else {
				const newContext = getContextZero();
				currentContext.current = newContext;
				setCurrentContextToRender(newContext);
			}
		}
	};
	const isCurrentContextToRender = (context: Context) => {
		return (
			context.order === currentContextToRender.order &&
			context.appearsAfter === currentContextToRender.appearsAfter
		);
	};

	return (
		<section>
			<h3 className='mb-2 text-xl font-bold'>Receiver</h3>
			<button
				className='mb-2 cursor-pointer rounded-md border border-neutral-300 bg-blue-500 px-3 py-1 text-white select-none disabled:cursor-not-allowed disabled:opacity-50'
				onClick={next}
				disabled={!isSomethingYet}
			>
				{isSomethingYet ? 'Next' : 'No more symbols to decode'}
			</button>
			<p className='mb-2'>
				Decoded message: <strong>{messageToRender}</strong>
			</p>

			<div className='space-y-4'>
				{contextsToRender.map((ctx) => (
					<div
						className={cn(isCurrentContextToRender(ctx) && 'bg-blue-100')}
						key={`${ctx.order}:${ctx.appearsAfter}`}
					>
						<p>
							<strong>Context {ctx.order} </strong>
							{ctx.appearsAfter && <span>after &quot;{ctx.appearsAfter}&quot;</span>}
						</p>
						<table className='w-full table-fixed border-collapse border border-neutral-300 text-center'>
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
			</div>
		</section>
	);
};

export default Receiver;
