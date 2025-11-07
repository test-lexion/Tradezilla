// src/Pages/pnl/page.tsx

import React, { useRef, useEffect, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import Navbar from '../../components/dashboard/navbar';
import PnlCard from '../../components/PnlCard';
import { useAppKitAccount } from "@reown/appkit/react";
import supabase from '../../components/testToken/database';
import { Skeleton } from '../../components/ui/skeleton';

// Define a type for our processed PnL data
interface PnlData {
    id: string;
    isProfit: boolean;
    percentage: number;
    tokenSymbol: string;
    realizedPnlUsd: number;
    totalInvested: number;
}

const PnlPage: React.FC = () => {
    const { address, isConnected } = useAppKitAccount();
    const [pnlData, setPnlData] = useState<PnlData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingStates, setDownloadingStates] = React.useState<{ [key: string]: boolean }>({});
    
    // Use a map to store refs for each dynamic card
    const cardRefs = useRef(new Map<string, React.RefObject<HTMLDivElement>>());

    useEffect(() => {
        const calculatePnl = (trades: any[]) => {
            // Group trades by the base token mint
            const tradesByToken = trades.reduce((acc, trade) => {
                const mint = trade.base_token_mint;
                if (!acc[mint]) {
                    acc[mint] = [];
                }
                acc[mint].push(trade);
                return acc;
            }, {});

            const calculatedPnl: PnlData[] = [];

            for (const mint in tradesByToken) {
                const tokenTrades = tradesByToken[mint];
                let totalBuyUsd = 0;
                let totalSellUsd = 0;
                
                tokenTrades.forEach((trade: any) => {
                    if (trade.trade_type === 'buy') {
                        totalBuyUsd += trade.transaction_value_usd;
                    } else if (trade.trade_type === 'sell') {
                        totalSellUsd += trade.transaction_value_usd;
                    }
                });

                // Only calculate PnL if there has been at least one buy and one sell
                if (totalBuyUsd > 0 && totalSellUsd > 0) {
                    const realizedPnl = totalSellUsd - totalBuyUsd;
                    const percentage = (realizedPnl / totalBuyUsd) * 100;
                    
                    calculatedPnl.push({
                        id: mint, // Use mint as a unique ID for the card
                        isProfit: realizedPnl >= 0,
                        percentage: parseFloat(percentage.toFixed(2)),
                        tokenSymbol: tokenTrades[0].base_token_symbol,
                        realizedPnlUsd: parseFloat(realizedPnl.toFixed(2)),
                        totalInvested: parseFloat(totalBuyUsd.toFixed(2)),
                    });
                }
            }
            setPnlData(calculatedPnl);
        };

        const fetchTradeHistory = async () => {
            if (!address) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);

            const { data, error } = await supabase
                .from('trade_history')
                .select('*')
                .eq('user_wallet', address);
            
            if (error) {
                console.error("Error fetching trade history:", error);
                // Handle error toast
            } else if (data) {
                calculatePnl(data);
            }
            setIsLoading(false);
        };

        fetchTradeHistory();

    }, [address]);

    // Function to download the PnL card as an image
    const downloadCard = async (ref: React.RefObject<HTMLDivElement>, transactionId: string, filename: string) => {
        if (!ref.current) return;
        setDownloadingStates(prev => ({ ...prev, [transactionId]: true }));
        try {
            const dataUrl = await htmlToImage.toPng(ref.current);
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setDownloadingStates(prev => ({ ...prev, [transactionId]: false }));
        }
    };
    
    // Ensure refs are created for each PnL card
    pnlData.forEach(pnl => {
        if (!cardRefs.current.has(pnl.id)) {
            cardRefs.current.set(pnl.id, React.createRef<HTMLDivElement>());
        }
    });

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[450px] w-full bg-background" />
                    <Skeleton className="h-[450px] w-full bg-background" />
                </div>
            )
        }

        if (!isConnected) {
            return <p className="text-center text-white/70">Please connect your wallet to view your PnL history.</p>
        }

        if (pnlData.length === 0) {
            return <p className="text-center text-white/70">No realized PnL to display. Make some trades to see your history here.</p>
        }

        return (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {pnlData.map(pnl => (
                    <div key={pnl.id}>
                        <div ref={cardRefs.current.get(pnl.id)}>
                            <PnlCard
                                isProfit={pnl.isProfit}
                                percentage={pnl.percentage}
                                tokenSymbol={pnl.tokenSymbol}
                                amount={pnl.realizedPnlUsd} // Display realized PnL in USD
                                duration="Realized" // Use a static or dynamic value
                                price={pnl.totalInvested} // You can repurpose this prop
                            />
                        </div>
                        <button 
                            className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-all duration-300 text-[12px] text-white rounded disabled:opacity-50"
                            onClick={() => downloadCard(
                                cardRefs.current.get(pnl.id)!,
                                pnl.id,
                                `${pnl.isProfit ? 'profit' : 'loss'}-${pnl.tokenSymbol}.png`
                            )}
                            disabled={downloadingStates[pnl.id]}
                        >
                            {downloadingStates[pnl.id] ? 'Downloading...' : 'Download Card'}
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className='w-full min-h-screen bg-secondary p-6'>
                <h1 className='text-3xl font-bold text-white mb-6'>Realized PnL History</h1>
                <div className='max-w-7xl mx-auto'>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PnlPage;
