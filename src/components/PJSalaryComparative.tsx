import React, { useState, useEffect, ChangeEvent, useCallback } from "react";

const NetToGross = () => {
  const [netSalary, setNetSalary] = useState<string>("");
  const [grossSalary, setGrossSalary] = useState<number | null>(null);
  const [INSS, setINSS] = useState<number | null>(null);
  const [IR, setIR] = useState<number | null>(null);
  const [FGTS, setFGTS] = useState<number | null>(null);
  const [voucherValue, setVoucherValue] = useState<string>("");
  const [voucherCost, setVoucherCost] = useState<number | null>(null);
  const [employerCost, setEmployerCost] = useState<number | null>(null);
  const [thirteenthCost, setThirteenthCost] = useState<number | null>(null);
  const [vacationCost, setVacationCost] = useState<number | null>(null);

  const getINSSDetails = (gross: number) => {
    if (gross <= 1306.10) return { aliquot: 0.075, deduction: 0 };
    if (gross <= 2433.71) return { aliquot: 0.09, deduction: 0 };
    if (gross <= 3459.47) return { aliquot: 0.12, deduction: 0 };
    if (gross <= 5881.94) return { aliquot: 0.14, deduction: 0 };
    return { aliquot: 0.14, deduction: 0 };
  };

  const getIRDetails = (base: number) => {
    if (base <= 2077.05) return { aliquot: 0.0, deduction: 0 };
    if (base <= 2563.92) return { aliquot: 0.075, deduction: 169.44 };
    if (base <= 3273.23) return { aliquot: 0.15, deduction: 381.44 };
    if (base <= 3912.19) return { aliquot: 0.225, deduction: 662.77 };
    return { aliquot: 0.275, deduction: 896.00 };
  };

  const calculateGrossSalary = useCallback((net: number): void => {
    let estimatedGross = net;
    let INSSvalue = 0;
    let IRvalue = 0;

    for (let i = 0; i < 20; i++) {
      const { aliquot: INSSaliquot } = getINSSDetails(estimatedGross);
      INSSvalue = estimatedGross * INSSaliquot;

      const baseIR = estimatedGross - INSSvalue;
      const { aliquot: IRaliquot, deduction: IRDeduction } = getIRDetails(baseIR);
      IRvalue = baseIR * IRaliquot - IRDeduction;

      const estimatedNet = estimatedGross - INSSvalue - IRvalue;
      const difference = net - estimatedNet;

      if (Math.abs(difference) < 1) {
        setGrossSalary(estimatedGross);
        setINSS(INSSvalue);
        setIR(IRvalue);
        setFGTS(estimatedGross * 0.08);
        return;
      }
      estimatedGross += difference / 2;
    }

    setGrossSalary(estimatedGross);
    setINSS(INSSvalue);
    setIR(IRvalue);
    setFGTS(estimatedGross * 0.08);
  }, []);

  const calculateEmployerCost = useCallback(() => {
    if (grossSalary !== null && INSS !== null && IR !== null) {
      const parsedNetSalary = parseFloat(netSalary) || 0;
      const parsedINSS = INSS || 0;
      const parsedIR = IR || 0;
      const parsedVoucherValue = parseFloat(voucherValue) || 0;
      const totalVoucherCost = parsedVoucherValue * 1.1;
      setVoucherCost(totalVoucherCost);

      const costForEmployer = ((parsedNetSalary + parsedINSS + parsedIR) * 1.08) * 1.2 + totalVoucherCost;
      setEmployerCost(costForEmployer);

      const thirteenth = grossSalary / 11;
      const vacation = (grossSalary / 11) * (4 / 3);

      setThirteenthCost(thirteenth);
      setVacationCost(vacation);
    }
  }, [grossSalary, INSS, IR, netSalary, voucherValue]);

  useEffect(() => {
    const parsedNetSalary = parseFloat(netSalary);
    if (!isNaN(parsedNetSalary)) {
      calculateGrossSalary(parsedNetSalary);
    } else {
      setGrossSalary(0);
      setIR(null);
      setINSS(null);
      setFGTS(null);
    }
  }, [netSalary, calculateGrossSalary]);

  useEffect(() => {
    calculateEmployerCost();
  }, [grossSalary, INSS, IR, calculateEmployerCost]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setNetSalary(value);
    }
  };

  const handleVoucherInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setVoucherValue(value);
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
      <div className="p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Salário Líquido para o Custo do Patrão</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Salário Líquido:</label>
          <input
            type="text"
            value={netSalary}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Valor dos Vales:</label>
          <input
            type="text"
            value={voucherValue}
            onChange={handleVoucherInputChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mt-4">
          <h2 className="block text-gray-700">Detalhes do Custo para o Patrão:</h2>
          <table className="table-auto w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Descrição</th>
                <th className="border border-gray-300 px-4 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Salário Bruto Estimado</td>
                <td className="border border-gray-300 px-4 py-2">R$ {grossSalary?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Desconto do INSS</td>
                <td className="border border-gray-300 px-4 py-2">R$ {INSS?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Desconto do IR</td>
                <td className="border border-gray-300 px-4 py-2">R$ {IR?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">FGTS</td>
                <td className="border border-gray-300 px-4 py-2">R$ {FGTS?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Custo dos Vales (com 10%)</td>
                <td className="border border-gray-300 px-4 py-2">R$ {voucherCost?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Custo do 13º Salário</td>
                <td className="border border-gray-300 px-4 py-2">R$ {thirteenthCost?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Custo das Férias</td>
                <td className="border border-gray-300 px-4 py-2">R$ {vacationCost?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-bold">Custo Total para o Patrão</td>
                <td className="border border-gray-300 px-4 py-2 font-bold">R$ {employerCost?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NetToGross;
