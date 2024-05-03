import { useState, useEffect } from "react";
import { OptionType } from "../models/optionType";
import GSTSlabDto from "../../features/Masters/GSTSlab/gstSlabDto";
import agent from "../api/agent";

export const useGstSlabs = (accessId: string): OptionType[] => {
  const [gstSlabs, setGstSlabs] = useState<OptionType[]>([]);

  useEffect(() => {
    const loadGSTSlab = async () => {
      try {
        const response = await agent.GSTSlab.getAllGSTSlabs(accessId);
        const formattedOptions: OptionType[] = response.map(
          (slab: GSTSlabDto) => ({
            label: slab.gstSlabName,
            value: slab.gstSlabID,
          })
        );
        setGstSlabs(formattedOptions);
      } catch (error) {
        console.error("Error fetching GST Slabs:", error);
      }
    };

    loadGSTSlab();
  }, [accessId]); // dependency array includes accessId to re-fetch if it changes

  return gstSlabs;
};
