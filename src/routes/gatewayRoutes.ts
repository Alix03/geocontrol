import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { Router } from "express";
import { GatewayFromJSON } from "@models/dto/Gateway";
import { createGateway, 
  deleteGateway, 
  getAllGateways, 
  getGateway, 
  updateGateway } from "@controllers/gatewayController";

const router = Router({ mergeParams: true });

// Get all gateways (Any authenticated user)
router.get("", async (req, res, next) => {
  try{
    res.status(200).json(await getAllGateways());
  }catch(error){
    next(error);
  }
});

// Create a new gateway (Admin & Operator)
router.post("", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try{
    await createGateway(GatewayFromJSON(req.body));
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

// Get a specific gateway (Any authenticated user)
router.get("/:gatewayMac", async (req, res, next) => {
  try{
    res.status(200).json(await getGateway(req.params.gatewayMac));
  }catch(error){
    next(error);
  }
});

// Update a gateway (Admin & Operator)
router.patch("/:gatewayMac", authenticateUser([UserType.Admin, UserType.Operator]), async (req, res, next) => {
  try{
    await updateGateway(req.params.gatewayMac,GatewayFromJSON(req.body));
    res.status(204).send();
  }catch(error){
    next(error);
  }
});

// Delete a gateway (Admin & Operator)
router.delete("/:gatewayMac", async (req, res, next) => {
  try{
    await deleteGateway(req.params.gatewayMac);
    res.status(204).send();
  }catch(error){
    next(error);
  }
});

export default router;
